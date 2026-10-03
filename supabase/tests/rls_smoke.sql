-- RLS smoke test: วางทั้งไฟล์ใน Supabase SQL Editor (role postgres) แล้วรันครั้งเดียว
-- ทุกอย่างอยู่ใน transaction เดียวและจบด้วย rollback จึงไม่ทิ้งข้อมูล
-- ผลแต่ละเทสต์ดูจาก notice (PASS/FAIL) และตารางสรุปก่อน rollback
-- ถ้าสคริปต์ error กลางคัน transaction จะค้างสถานะ aborted ให้รัน rollback; ก่อนรันซ้ำ
-- ข้อควรระวัง: role postgres ข้าม RLS ได้ ต้องสลับเป็น authenticated ผ่าน rls_test.as_user เท่านั้น
--   เทสต์ harness ด้านล่างตรวจให้ว่า current_user และ auth.uid() ถูกต้องจริง

begin;

-- ===== Helpers =====

-- schema ชั่วคราว (หายตอน rollback) ไม่ใช้ pg_temp เพราะ role authenticated เรียก pg_temp ไม่ได้แน่นอน
create schema rls_test;
grant usage on schema rls_test to authenticated;

create table rls_test.results (
  id bigint generated always as identity primary key,
  name text not null,
  ok boolean not null,
  detail text
);

-- เก็บ id ที่สร้างระหว่างเทสต์ (group, task) ให้ทุก role อ่าน/เขียนได้
create table rls_test.ctx (
  key text primary key,
  val text not null
);
grant select, insert on rls_test.ctx to authenticated;

-- ดึงค่า id จาก ctx
create function rls_test.v(k text) returns uuid
language sql stable as $fn$
  select val::uuid from rls_test.ctx where key = k;
$fn$;

-- UUID คงที่ของ user ทดสอบ
create function rls_test.u(who text) returns uuid
language sql immutable as $fn$
  select case who
    when 'alice' then 'a1111111-1111-4111-8111-111111111111'
    when 'bob'   then 'b2222222-2222-4222-8222-222222222222'
    when 'carol' then 'c3333333-3333-4333-8333-333333333333'
    when 'dave'  then 'd4444444-4444-4444-8444-444444444444'
    when 'edge_no_email'   then 'e5555555-5555-4555-8555-555555555555'
    when 'edge_long_name'  then 'e6666666-6666-4666-8666-666666666666'
    when 'edge_at_email'   then 'e7777777-7777-4777-8777-777777777777'
  end::uuid;
$fn$;

-- security definer เฉพาะการบันทึกผล เพื่อให้ role authenticated เขียนผลได้
-- ส่วน sql ที่ถูกทดสอบรันเป็น security invoker เสมอ
create function rls_test.record(test_name text, passed boolean, info text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $fn$
begin
  insert into rls_test.results (name, ok, detail) values (test_name, passed, info);
  if passed then
    raise notice 'PASS: %', test_name;
  else
    raise notice 'FAIL: % -- %', test_name, coalesce(info, '');
  end if;
end;
$fn$;

-- สลับเป็น user ทดสอบ: reset role แล้วตั้ง jwt claims ใหม่ จากนั้น set local role
-- ฟังก์ชันนี้ไม่ใช่ security definer และไม่มี SET clause จึงมีผลต่อเนื่องจนจบ transaction
create function rls_test.as_user(who text) returns void
language plpgsql as $fn$
begin
  execute 'reset role';
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', rls_test.u(who), 'role', 'authenticated')::text,
    true
  );
  execute 'set local role authenticated';
end;
$fn$;

-- กลับเป็น postgres (ข้าม RLS) ใช้ตอน setup และตรวจผลตรงๆ
create function rls_test.as_postgres() returns void
language plpgsql as $fn$
begin
  execute 'reset role';
  perform set_config('request.jwt.claims', '', true);
end;
$fn$;

-- ต้อง error (ถ้าระบุ msg_like ข้อความ error ต้องตรงด้วย)
create function rls_test.expect_error(test_name text, stmt text, msg_like text default null)
returns void
language plpgsql as $fn$
declare
  err text;
begin
  begin
    execute stmt;
  exception when others then
    err := sqlerrm;
  end;

  if err is null then
    perform rls_test.record(test_name, false, 'expected an error but the statement succeeded');
  elsif msg_like is not null and err not ilike msg_like then
    perform rls_test.record(test_name, false, 'unexpected error text: ' || err);
  else
    perform rls_test.record(test_name, true, err);
  end if;
end;
$fn$;

-- นับแถวของ select ต้องเท่ากับ expected
create function rls_test.expect_rows(test_name text, stmt text, expected bigint)
returns void
language plpgsql as $fn$
declare
  actual bigint;
begin
  begin
    execute format('select count(*) from (%s) q', stmt) into actual;
  exception when others then
    perform rls_test.record(test_name, false, 'unexpected error: ' || sqlerrm);
    return;
  end;

  perform rls_test.record(
    test_name,
    actual = expected,
    case when actual = expected then null
         else format('expected %s rows, got %s', expected, actual) end
  );
end;
$fn$;

-- DML ต้องไม่ error และกระทบแถวตามจำนวน (ใช้ทั้ง setup และเทสต์ที่ RLS กรองเป็น 0 แถว)
create function rls_test.expect_affected(test_name text, stmt text, expected bigint)
returns void
language plpgsql as $fn$
declare
  actual bigint;
begin
  begin
    execute stmt;
    get diagnostics actual = row_count;
  exception when others then
    perform rls_test.record(test_name, false, 'unexpected error: ' || sqlerrm);
    return;
  end;

  perform rls_test.record(
    test_name,
    actual = expected,
    case when actual = expected then null
         else format('expected %s affected rows, got %s', expected, actual) end
  );
end;
$fn$;

create function rls_test.summary() returns void
language plpgsql as $fn$
declare
  passed_count bigint;
  failed_count bigint;
begin
  select count(*) filter (where ok), count(*) filter (where not ok)
    into passed_count, failed_count
  from rls_test.results;
  raise notice 'SUMMARY: % passed, % FAILED', passed_count, failed_count;
end;
$fn$;

-- ===== Setup: สร้าง user ทดสอบ 3+1 คน =====
-- auth.users ของ Supabase: คอลัมน์ not null ที่ไม่มี default มีแค่ id (instance_id, aud ฯลฯ เป็น nullable)
-- ตรวจเองได้ด้วย: select column_name from information_schema.columns
--   where table_schema = 'auth' and table_name = 'users' and is_nullable = 'NO' and column_default is null;
-- ถ้า Supabase เพิ่มคอลัมน์ required ใหม่ insert นี้จะ error ให้เติมค่าตามนั้น
select rls_test.as_postgres();

insert into auth.users (id, aud, role, email, raw_user_meta_data) values
  (rls_test.u('alice'), 'authenticated', 'authenticated', 'alice@example.test', '{"full_name":"Alice"}'),
  (rls_test.u('bob'),   'authenticated', 'authenticated', 'bob@example.test',   '{}'),
  (rls_test.u('carol'), 'authenticated', 'authenticated', 'carol@example.test', '{"name":"Carol"}'),
  (rls_test.u('dave'),  'authenticated', 'authenticated', 'dave@example.test',  '{"full_name":"Dave"}');

select rls_test.expect_rows('setup: handle_new_user created 4 profiles',
  $q$select 1 from public.profiles where id in (rls_test.u('alice'), rls_test.u('bob'), rls_test.u('carol'), rls_test.u('dave'))$q$, 4);
select rls_test.expect_rows('setup: alice profile name from full_name',
  $q$select 1 from public.profiles where id = rls_test.u('alice') and display_name = 'Alice'$q$, 1);
select rls_test.expect_rows('setup: bob profile name falls back to email local part',
  $q$select 1 from public.profiles where id = rls_test.u('bob') and display_name = 'bob'$q$, 1);
select rls_test.expect_rows('setup: carol profile name from name',
  $q$select 1 from public.profiles where id = rls_test.u('carol') and display_name = 'Carol'$q$, 1);

-- harness: ยืนยันว่าสลับ role ได้จริง ไม่งั้นทุกเทสต์ด้านล่างไร้ความหมาย (postgres ข้าม RLS)
select rls_test.as_user('alice');
select rls_test.expect_rows('harness: current_user is authenticated and auth.uid() is alice',
  $q$select 1 where current_user = 'authenticated' and auth.uid() = rls_test.u('alice')$q$, 1);

-- ===== 1. alice create_group เป็น admin; bob ที่ยังไม่เป็นสมาชิกมองไม่เห็น =====
select rls_test.as_user('alice');
select rls_test.expect_affected('1: alice create_group',
  $q$insert into rls_test.ctx select 'g1', public.create_group('Study Group')::text$q$, 1);
select rls_test.expect_rows('1: alice is admin of the new group',
  $q$select 1 from public.memberships where group_id = rls_test.v('g1') and user_id = auth.uid() and role = 'admin'$q$, 1);
select rls_test.expect_affected('1: alice creates task T1 (setup)',
  $q$with ins as (
       insert into public.tasks (group_id, title, created_by)
       values (rls_test.v('g1'), 'T1', auth.uid()) returning id
     )
     insert into rls_test.ctx select 't1', id::text from ins$q$, 1);

select rls_test.as_user('bob');
select rls_test.expect_rows('1: non-member bob cannot see groups',
  $q$select 1 from public.groups$q$, 0);
select rls_test.expect_rows('1: non-member bob cannot see memberships',
  $q$select 1 from public.memberships$q$, 0);
select rls_test.expect_rows('1: non-member bob cannot see tasks',
  $q$select 1 from public.tasks$q$, 0);

-- ===== 2. bob insert memberships ตรงๆ ไม่ได้; join_group code ผิด =====
select rls_test.as_user('bob');
select rls_test.expect_error('2: bob direct INSERT into memberships (as member) is rejected',
  $q$insert into public.memberships (group_id, user_id, role) values (rls_test.v('g1'), auth.uid(), 'member')$q$,
  '%row-level security%');
select rls_test.expect_error('2: bob direct INSERT into memberships (as admin) is rejected',
  $q$insert into public.memberships (group_id, user_id, role) values (rls_test.v('g1'), auth.uid(), 'admin')$q$,
  '%row-level security%');
select rls_test.expect_error('2: join_group with a wrong code',
  $q$select public.join_group('no-such-code-xyz')$q$,
  '%invalid or expired invite%');

-- ===== 3. invite และ join_group =====
select rls_test.as_user('alice');
select rls_test.expect_affected('3: alice creates 4 invites',
  $q$insert into public.invites (group_id, code, created_by, max_uses, expires_at) values
       (rls_test.v('g1'), 'code-open-0001',  auth.uid(), null, now() + interval '1 day'),
       (rls_test.v('g1'), 'code-one-0001x',  auth.uid(), 1,    now() + interval '1 day'),
       (rls_test.v('g1'), 'code-revoked-01', auth.uid(), null, now() + interval '1 day'),
       (rls_test.v('g1'), 'code-expired-01', auth.uid(), null, now() - interval '1 hour')$q$, 4);
select rls_test.expect_affected('3: alice revokes an invite',
  $q$update public.invites set revoked_at = now() where code = 'code-revoked-01'$q$, 1);

select rls_test.as_user('bob');
select rls_test.expect_rows('3: bob joins with open invite and gets the group id back',
  $q$select 1 where public.join_group('code-open-0001') = rls_test.v('g1')$q$, 1);
select rls_test.expect_rows('3: bob joined as plain member only',
  $q$select 1 from public.memberships where group_id = rls_test.v('g1') and user_id = auth.uid() and role = 'member'$q$, 1);
select rls_test.expect_rows('3: bob repeat join_group still succeeds',
  $q$select 1 where public.join_group('code-open-0001') = rls_test.v('g1')$q$, 1);

select rls_test.as_user('alice');
select rls_test.expect_rows('3: repeat join did not increase use_count (still 1)',
  $q$select 1 from public.invites where code = 'code-open-0001' and use_count = 1$q$, 1);

-- dave ใช้ invite max_uses=1 จนครบ แล้ว carol ต้องเข้าไม่ได้
select rls_test.as_user('dave');
select rls_test.expect_rows('3: dave joins with max_uses=1 invite',
  $q$select 1 where public.join_group('code-one-0001x') = rls_test.v('g1')$q$, 1);
select rls_test.as_user('carol');
select rls_test.expect_error('3: carol cannot use an exhausted invite',
  $q$select public.join_group('code-one-0001x')$q$, '%invalid or expired invite%');
select rls_test.expect_error('3: carol cannot use a revoked invite',
  $q$select public.join_group('code-revoked-01')$q$, '%invalid or expired invite%');
select rls_test.expect_error('3: carol cannot use an expired invite',
  $q$select public.join_group('code-expired-01')$q$, '%invalid or expired invite%');
select rls_test.expect_rows('3: carol is still not a member after failed joins',
  $q$select 1 from public.memberships where user_id = auth.uid()$q$, 0);

-- ===== 4. member ทำสิ่งที่เป็นสิทธิ์ admin ไม่ได้; การมองเห็น profile =====
select rls_test.as_user('bob');
select rls_test.expect_error('4: member bob cannot create a task',
  $q$insert into public.tasks (group_id, title, created_by) values (rls_test.v('g1'), 'bob task', auth.uid())$q$,
  '%row-level security%');
select rls_test.expect_error('4: member bob cannot create an invite',
  $q$insert into public.invites (group_id, code, created_by) values (rls_test.v('g1'), 'code-bob-000001', auth.uid())$q$,
  '%row-level security%');
select rls_test.expect_affected('4: member bob cannot change own role (RLS filters to 0 rows)',
  $q$update public.memberships set role = 'admin' where group_id = rls_test.v('g1') and user_id = auth.uid()$q$, 0);
select rls_test.expect_rows('4: member bob cannot read invites',
  $q$select 1 from public.invites$q$, 0);
select rls_test.expect_rows('4: bob sees alice profile (same group)',
  $q$select 1 from public.profiles where id = rls_test.u('alice')$q$, 1);
select rls_test.expect_rows('4: bob does not see carol profile (no shared group)',
  $q$select 1 from public.profiles where id = rls_test.u('carol')$q$, 0);

select rls_test.as_user('carol');
select rls_test.expect_rows('4: carol (no group) does not see alice or bob profile',
  $q$select 1 from public.profiles where id in (rls_test.u('alice'), rls_test.u('bob'))$q$, 0);
select rls_test.expect_rows('4: carol sees only her own profile',
  $q$select 1 from public.profiles$q$, 1);

-- ===== 5. tasks และ task_assignees =====
select rls_test.as_user('alice');
select rls_test.expect_affected('5: alice creates task T2 (setup)',
  $q$with ins as (
       insert into public.tasks (group_id, title, created_by)
       values (rls_test.v('g1'), 'T2', auth.uid()) returning id
     )
     insert into rls_test.ctx select 't2', id::text from ins$q$, 1);
select rls_test.expect_affected('5: alice assigns T2 to bob',
  $q$insert into public.task_assignees (task_id, user_id) values (rls_test.v('t2'), rls_test.u('bob'))$q$, 1);
select rls_test.expect_affected('5: alice assigns T2 to herself',
  $q$insert into public.task_assignees (task_id, user_id) values (rls_test.v('t2'), auth.uid())$q$, 1);
select rls_test.expect_error('5: alice cannot assign T2 to non-member carol',
  $q$insert into public.task_assignees (task_id, user_id) values (rls_test.v('t2'), rls_test.u('carol'))$q$,
  '%assignee must be a member%');

select rls_test.as_user('bob');
select rls_test.expect_affected('5: bob updates own assignment status',
  $q$update public.task_assignees set status = 'doing' where task_id = rls_test.v('t2') and user_id = auth.uid()$q$, 1);
select rls_test.expect_affected('5: bob cannot update alice assignment status (0 rows)',
  $q$update public.task_assignees set status = 'done' where task_id = rls_test.v('t2') and user_id = rls_test.u('alice')$q$, 0);
select rls_test.expect_error('5: bob cannot change user_id (column privilege)',
  $q$update public.task_assignees set user_id = rls_test.u('carol') where task_id = rls_test.v('t2') and user_id = auth.uid()$q$,
  '%permission denied%');
select rls_test.expect_error('5: bob cannot change task_id (column privilege)',
  $q$update public.task_assignees set task_id = rls_test.v('t1') where task_id = rls_test.v('t2') and user_id = auth.uid()$q$,
  '%permission denied%');

-- ===== 9. availability_slots และ events (ทำก่อนข้อ 6/8 เพราะต้องใช้ bob ที่ยังอยู่ในกลุ่ม) =====
select rls_test.as_user('alice');
select rls_test.expect_affected('9: alice inserts 2 availability slots',
  $q$insert into public.availability_slots (user_id, day_of_week, slot_index) values (auth.uid(), 0, 0), (auth.uid(), 0, 1)$q$, 2);
select rls_test.as_user('carol');
select rls_test.expect_affected('9: carol inserts 1 availability slot',
  $q$insert into public.availability_slots (user_id, day_of_week, slot_index) values (auth.uid(), 1, 0)$q$, 1);

select rls_test.as_user('bob');
select rls_test.expect_rows('9: bob sees alice slots (same group)',
  $q$select 1 from public.availability_slots where user_id = rls_test.u('alice')$q$, 2);
select rls_test.expect_rows('9: bob does not see carol slots (no shared group)',
  $q$select 1 from public.availability_slots where user_id = rls_test.u('carol')$q$, 0);
select rls_test.expect_error('9: bob cannot insert a slot for alice',
  $q$insert into public.availability_slots (user_id, day_of_week, slot_index) values (rls_test.u('alice'), 2, 0)$q$,
  '%row-level security%');
select rls_test.expect_error('9: member bob cannot insert an event',
  $q$insert into public.events (group_id, title, starts_at, ends_at, created_by)
     values (rls_test.v('g1'), 'bob event', now(), now() + interval '1 hour', auth.uid())$q$,
  '%row-level security%');

select rls_test.as_user('alice');
select rls_test.expect_affected('9: admin alice inserts an event',
  $q$insert into public.events (group_id, title, starts_at, ends_at, created_by)
     values (rls_test.v('g1'), 'Kickoff', now(), now() + interval '1 hour', auth.uid())$q$, 1);
select rls_test.as_user('bob');
select rls_test.expect_rows('9: member bob can read the event',
  $q$select 1 from public.events where group_id = rls_test.v('g1')$q$, 1);
select rls_test.as_user('carol');
select rls_test.expect_rows('9: non-member carol cannot read the event',
  $q$select 1 from public.events$q$, 0);

-- ===== 6. admin คนสุดท้าย =====
-- ตอนนี้ g1: alice = admin เดียว, bob และ dave = member
select rls_test.as_user('alice');
select rls_test.expect_error('6: sole admin alice cannot demote herself',
  $q$update public.memberships set role = 'member' where group_id = rls_test.v('g1') and user_id = auth.uid()$q$,
  '%at least one admin%');
select rls_test.expect_error('6: sole admin alice cannot leave the group',
  $q$delete from public.memberships where group_id = rls_test.v('g1') and user_id = auth.uid()$q$,
  '%at least one admin%');
select rls_test.expect_affected('6: alice promotes bob to admin',
  $q$update public.memberships set role = 'admin' where group_id = rls_test.v('g1') and user_id = rls_test.u('bob')$q$, 1);
select rls_test.expect_affected('6: alice can demote herself once bob is admin',
  $q$update public.memberships set role = 'member' where group_id = rls_test.v('g1') and user_id = auth.uid()$q$, 1);

-- คืนสถานะ: bob promote alice กลับ แล้ว bob ลดตัวเองเป็น member (alice admin, bob member)
select rls_test.as_user('bob');
select rls_test.expect_error('6: now sole admin bob cannot demote himself',
  $q$update public.memberships set role = 'member' where group_id = rls_test.v('g1') and user_id = auth.uid()$q$,
  '%at least one admin%');
select rls_test.expect_affected('6: bob promotes alice back to admin',
  $q$update public.memberships set role = 'admin' where group_id = rls_test.v('g1') and user_id = rls_test.u('alice')$q$, 1);
select rls_test.expect_affected('6: bob demotes himself (alice is admin again)',
  $q$update public.memberships set role = 'member' where group_id = rls_test.v('g1') and user_id = auth.uid()$q$, 1);

-- ===== 8. สมาชิกออกจากกลุ่ม -> task_assignees ของเขาถูกลบ =====
select rls_test.as_user('bob');
select rls_test.expect_affected('8: bob leaves the group',
  $q$delete from public.memberships where group_id = rls_test.v('g1') and user_id = auth.uid()$q$, 1);
select rls_test.as_postgres();
select rls_test.expect_rows('8: bob assignment on T2 was removed',
  $q$select 1 from public.task_assignees where task_id = rls_test.v('t2') and user_id = rls_test.u('bob')$q$, 0);
select rls_test.expect_rows('8: alice assignment on T2 is untouched',
  $q$select 1 from public.task_assignees where task_id = rls_test.v('t2') and user_id = rls_test.u('alice')$q$, 1);

-- ===== 7. ลบกลุ่มที่มีหลายสมาชิกโดย admin เดียว (cascade) =====
select rls_test.as_user('alice');
select rls_test.expect_affected('7: alice creates group G2 (setup)',
  $q$insert into rls_test.ctx select 'g2', public.create_group('Doomed Group')::text$q$, 1);
select rls_test.expect_affected('7: alice creates invite for G2 (setup)',
  $q$insert into public.invites (group_id, code, created_by) values (rls_test.v('g2'), 'code-g2-000001', auth.uid())$q$, 1);
select rls_test.as_user('bob');
select rls_test.expect_rows('7: bob joins G2 (setup)',
  $q$select 1 where public.join_group('code-g2-000001') = rls_test.v('g2')$q$, 1);
select rls_test.as_user('carol');
select rls_test.expect_rows('7: carol joins G2 (setup)',
  $q$select 1 where public.join_group('code-g2-000001') = rls_test.v('g2')$q$, 1);
select rls_test.as_user('alice');
select rls_test.expect_affected('7: alice creates task T3 in G2 (setup)',
  $q$with ins as (
       insert into public.tasks (group_id, title, created_by)
       values (rls_test.v('g2'), 'T3', auth.uid()) returning id
     )
     insert into rls_test.ctx select 't3', id::text from ins$q$, 1);
select rls_test.expect_affected('7: alice assigns T3 to bob (setup)',
  $q$insert into public.task_assignees (task_id, user_id) values (rls_test.v('t3'), rls_test.u('bob'))$q$, 1);
select rls_test.expect_affected('7: sole admin alice deletes G2 with 3 members',
  $q$delete from public.groups where id = rls_test.v('g2')$q$, 1);

select rls_test.as_postgres();
select rls_test.expect_rows('7: G2 memberships are gone',
  $q$select 1 from public.memberships where group_id = rls_test.v('g2')$q$, 0);
select rls_test.expect_rows('7: G2 tasks are gone',
  $q$select 1 from public.tasks where group_id = rls_test.v('g2')$q$, 0);
select rls_test.expect_rows('7: G2 task_assignees are gone',
  $q$select 1 from public.task_assignees where task_id = rls_test.v('t3')$q$, 0);
select rls_test.expect_rows('7: G2 invites are gone',
  $q$select 1 from public.invites where group_id = rls_test.v('g2')$q$, 0);

-- ===== 10. handle_new_user กรณีขอบ =====
select rls_test.as_postgres();
select rls_test.expect_affected('10: insert user without email',
  $q$insert into auth.users (id, aud, role, email, raw_user_meta_data)
     values (rls_test.u('edge_no_email'), 'authenticated', 'authenticated', null, null)$q$, 1);
select rls_test.expect_affected('10: insert user with 120-char metadata name',
  $q$insert into auth.users (id, aud, role, email, raw_user_meta_data)
     values (rls_test.u('edge_long_name'), 'authenticated', 'authenticated', 'longname@example.test',
             jsonb_build_object('full_name', repeat('x', 120)))$q$, 1);
select rls_test.expect_affected('10: insert user whose email starts with @',
  $q$insert into auth.users (id, aud, role, email, raw_user_meta_data)
     values (rls_test.u('edge_at_email'), 'authenticated', 'authenticated', '@nolocal.example.test', '{}')$q$, 1);

select rls_test.expect_rows('10: profile exists for user without email (fallback name)',
  $q$select 1 from public.profiles where id = rls_test.u('edge_no_email') and display_name = 'user'$q$, 1);
select rls_test.expect_rows('10: long metadata name truncated to 80 chars',
  $q$select 1 from public.profiles where id = rls_test.u('edge_long_name') and char_length(display_name) = 80$q$, 1);
select rls_test.expect_rows('10: profile exists for email starting with @ (fallback name)',
  $q$select 1 from public.profiles where id = rls_test.u('edge_at_email') and display_name = 'user'$q$, 1);

-- ===== Summary =====
select rls_test.as_postgres();
select rls_test.summary();
-- ถ้า editor ไม่โชว์ notice ให้ดูตารางนี้ (แถว ok = false คือเทสต์ที่ FAIL)
select id, case when ok then 'PASS' else 'FAIL' end as result, name, detail
from rls_test.results
order by id;

rollback;

-- ===== H1: race ของ admin 2 คนลดสิทธิ์พร้อมกัน (ทดสอบในสคริปต์เดียวไม่ได้) =====
-- ต้องทำมือด้วย SQL Editor 2 แท็บ และใช้ข้อมูลจริง (ลบทิ้งหลังทดสอบ) เพราะ rollback ด้านบนไม่เหลือข้อมูล:
-- 1) เตรียมกลุ่มที่มี admin 2 คน (A และ B) เช่นสร้างด้วย create_group แล้ว promote อีกคน
-- 2) แท็บ 1: begin; set local role authenticated; select set_config('request.jwt.claims','{"sub":"<A>","role":"authenticated"}',true);
--    update public.memberships set role='member' where group_id='<G>' and user_id='<A>';   -- ยังไม่ commit
-- 3) แท็บ 2: ตั้ง claims ของ <B> แบบเดียวกัน แล้วรัน update ลด role ของ <B> -> ต้องค้างรอ lock (groups row)
-- 4) แท็บ 1: commit; -> แท็บ 2 ต้อง error 'a group must keep at least one admin' และกลุ่มเหลือ admin อย่างน้อย 1 คน

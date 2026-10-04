-- ข้อมูลตัวอย่างสำหรับถ่าย screenshot: วางทั้งไฟล์ใน Supabase SQL Editor (role postgres) แล้วรันครั้งเดียว
-- เจ้าของกลุ่ม = บัญชีที่ login ด้วย Google (ต้องมีบัญชี Google เพียงบัญชีเดียว)
-- สมาชิกสมมติ 5 คนไม่มีรหัสผ่าน จึง login ไม่ได้
-- ลบข้อมูลทั้งหมดได้ด้วย demo_cleanup.sql

begin;

do $$
declare
  v_owner uuid;
  v_group uuid := 'd0000000-0000-4000-8000-000000000100';
  v_nat uuid := 'd0000000-0000-4000-8000-000000000001';
  v_pim uuid := 'd0000000-0000-4000-8000-000000000002';
  v_than uuid := 'd0000000-0000-4000-8000-000000000003';
  v_siri uuid := 'd0000000-0000-4000-8000-000000000004';
  v_kit uuid := 'd0000000-0000-4000-8000-000000000005';
  -- เวลาเที่ยงคืนของวันนี้ตามเวลาไทย ใช้คำนวณ deadline ให้สัมพันธ์กับวันที่รัน
  v_today timestamp := date_trunc('day', now() at time zone 'Asia/Bangkok');
  v_next_monday timestamp := date_trunc('week', now() at time zone 'Asia/Bangkok') + interval '7 days';
  v_task uuid;
begin
  -- ดูจาก auth.identities เพราะบัญชีที่สมัครด้วยอีเมลแล้วผูก Google ภายหลังยังมี provider = email
  if (select count(distinct user_id) from auth.identities where provider = 'google') <> 1 then
    raise exception 'expected exactly one Google account to own the demo group';
  end if;
  select distinct user_id into v_owner from auth.identities where provider = 'google';

  if exists (select 1 from public.groups where id = v_group) then
    raise exception 'demo data already exists, run demo_cleanup.sql first';
  end if;

  -- trigger handle_new_user สร้าง profile จาก full_name ให้เอง
  insert into auth.users (id, aud, role, email, raw_user_meta_data) values
    (v_nat,  'authenticated', 'authenticated', 'demo1@example.test', '{"full_name":"ณัฐวุฒิ ศรีสุข"}'),
    (v_pim,  'authenticated', 'authenticated', 'demo2@example.test', '{"full_name":"พิมพ์ชนก วงศ์ไทย"}'),
    (v_than, 'authenticated', 'authenticated', 'demo3@example.test', '{"full_name":"ธนกร แก้วมณี"}'),
    (v_siri, 'authenticated', 'authenticated', 'demo4@example.test', '{"full_name":"ศิริพร ใจดี"}'),
    (v_kit,  'authenticated', 'authenticated', 'demo5@example.test', '{"full_name":"กิตติพัฒน์ บุญมา"}');

  insert into public.groups (id, name, description, created_by) values
    (v_group, 'โปรเจกต์วิชา Software Engineering',
     'พัฒนาระบบจองห้องอ่านหนังสือของห้องสมุดคณะ ส่งงานทุก Sprint 2 สัปดาห์', v_owner);

  insert into public.memberships (group_id, user_id, role) values
    (v_group, v_owner, 'admin'),
    (v_group, v_nat, 'member'),
    (v_group, v_pim, 'member'),
    (v_group, v_than, 'member'),
    (v_group, v_siri, 'member'),
    (v_group, v_kit, 'member');

  -- งานครอบคลุมทุกสถานะ: เสร็จแล้ว, กำลังทำ, ยังไม่เริ่ม และเลยกำหนด
  insert into public.tasks (group_id, title, description, deadline, created_by)
  values (v_group, 'เขียน Software Requirement Specification', 'รวบรวม functional และ non-functional requirement จากการสัมภาษณ์บรรณารักษ์',
          (v_today - interval '10 days' + interval '23 hours 59 minutes') at time zone 'Asia/Bangkok', v_owner)
  returning id into v_task;
  insert into public.task_assignees (task_id, user_id, status) values (v_task, v_owner, 'done'), (v_task, v_pim, 'done');

  insert into public.tasks (group_id, title, description, deadline, created_by)
  values (v_group, 'ออกแบบ Use Case Diagram', null,
          (v_today - interval '6 days' + interval '18 hours') at time zone 'Asia/Bangkok', v_owner)
  returning id into v_task;
  insert into public.task_assignees (task_id, user_id, status) values (v_task, v_nat, 'done'), (v_task, v_than, 'done');

  insert into public.tasks (group_id, title, description, deadline, created_by)
  values (v_group, 'ออกแบบ ER Diagram และฐานข้อมูล', 'ตาราง rooms, bookings, users พร้อม constraint กันจองซ้อน',
          (v_today - interval '2 days' + interval '23 hours 59 minutes') at time zone 'Asia/Bangkok', v_owner)
  returning id into v_task;
  insert into public.task_assignees (task_id, user_id, status) values (v_task, v_than, 'doing');

  insert into public.tasks (group_id, title, description, deadline, created_by)
  values (v_group, 'ทำ Wireframe หน้าจอหลัก', 'หน้าค้นหาห้อง หน้าจอง และหน้าประวัติการจอง',
          (v_today + interval '1 day' + interval '18 hours') at time zone 'Asia/Bangkok', v_owner)
  returning id into v_task;
  insert into public.task_assignees (task_id, user_id, status) values (v_task, v_siri, 'doing'), (v_task, v_owner, 'done');

  insert into public.tasks (group_id, title, description, deadline, created_by)
  values (v_group, 'พัฒนาระบบ Login ด้วยบัญชีมหาวิทยาลัย', null,
          (v_today + interval '4 days' + interval '23 hours 59 minutes') at time zone 'Asia/Bangkok', v_owner)
  returning id into v_task;
  insert into public.task_assignees (task_id, user_id, status) values (v_task, v_kit, 'doing'), (v_task, v_nat, 'todo');

  insert into public.tasks (group_id, title, description, deadline, created_by)
  values (v_group, 'เขียน Unit Test โมดูลการจอง', 'ครอบคลุมกรณีจองซ้อนเวลาและยกเลิกการจอง',
          (v_today + interval '8 days' + interval '23 hours 59 minutes') at time zone 'Asia/Bangkok', v_owner)
  returning id into v_task;
  insert into public.task_assignees (task_id, user_id, status) values (v_task, v_pim, 'todo'), (v_task, v_kit, 'todo');

  insert into public.tasks (group_id, title, description, deadline, created_by)
  values (v_group, 'เตรียมสไลด์นำเสนอ Sprint Review', null,
          (v_today + interval '12 days' + interval '9 hours') at time zone 'Asia/Bangkok', v_owner)
  returning id into v_task;
  insert into public.task_assignees (task_id, user_id, status) values (v_task, v_owner, 'todo'), (v_task, v_siri, 'todo');

  insert into public.tasks (group_id, title, description, deadline, created_by)
  values (v_group, 'สรุปรายงานการประชุมครั้งที่ 3', null, null, v_owner)
  returning id into v_task;
  insert into public.task_assignees (task_id, user_id, status) values (v_task, v_siri, 'done');

  -- เวลาว่าง: (user, วันที่ 0=จันทร์..6=อาทิตย์, ชั่วโมงเริ่ม, ชั่วโมงจบ) แตกเป็นช่องละ 30 นาที
  -- ตั้งให้ช่วงเย็นวันธรรมดาว่างตรงกันหลายคน heatmap จะได้มีหลายระดับสี
  insert into public.availability_slots (user_id, day_of_week, slot_index)
  select distinct r.user_id, d.day, s.slot
  from (values
    (v_owner, array[0,1,2,3,4], 18, 22), (v_owner, array[1,3], 13, 16), (v_owner, array[5], 9, 12),
    (v_nat,   array[0,1,2,3,4], 17, 21), (v_nat,   array[5], 10, 16),
    (v_pim,   array[0,2,4], 13, 17),     (v_pim,   array[0,1,2,3], 19, 22), (v_pim, array[6], 13, 18),
    (v_than,  array[0,1,2,3,4], 18, 20), (v_than,  array[1,3], 9, 12),     (v_than, array[5], 9, 12),
    (v_siri,  array[0,2], 18, 22),       (v_siri,  array[1,3], 15, 19),    (v_siri, array[5], 13, 17), (v_siri, array[6], 9, 12),
    (v_kit,   array[0,1,2,3,4], 20, 23), (v_kit,   array[2], 13, 16),      (v_kit,  array[6], 14, 20)
  ) as r(user_id, days, from_hour, to_hour)
  cross join lateral unnest(r.days) as d(day)
  cross join lateral generate_series(r.from_hour * 2, r.to_hour * 2 - 1) as s(slot)
  on conflict do nothing;

  -- นัดหมายในช่วงที่ heatmap บอกว่าว่างตรงกันมากที่สุด (จันทร์และพุธ 19:00-20:00 ว่าง 5 จาก 6 คน)
  insert into public.events (group_id, title, description, starts_at, ends_at, created_by) values
    (v_group, 'ประชุมวางแผน Sprint 3', 'แบ่งงานและประเมิน story point',
     (v_next_monday + interval '19 hours') at time zone 'Asia/Bangkok',
     (v_next_monday + interval '20 hours') at time zone 'Asia/Bangkok', v_owner),
    (v_group, 'Demo ความคืบหน้ากับอาจารย์ที่ปรึกษา', null,
     (v_next_monday + interval '2 days 19 hours') at time zone 'Asia/Bangkok',
     (v_next_monday + interval '2 days 20 hours') at time zone 'Asia/Bangkok', v_owner);

  raise notice 'demo data created: group %, owner %', v_group, v_owner;
end;
$$;

commit;

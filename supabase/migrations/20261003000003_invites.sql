-- ก้อนที่ 3: invites และ join_group

create table public.invites (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  code text not null unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)
    check (char_length(code) >= 12),
  created_by uuid not null references public.profiles (id),
  expires_at timestamptz default now() + interval '7 days',
  max_uses integer check (max_uses is null or max_uses > 0),
  use_count integer not null default 0,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index invites_group_id_idx on public.invites (group_id);

alter table public.invites enable row level security;

-- เฉพาะ admin ของกลุ่มจัดการ invite ได้ (คนถือ code เข้าผ่าน join_group)
create policy "invites_select_admin" on public.invites
  for select to authenticated
  using (public.is_group_admin(group_id));

create policy "invites_insert_admin" on public.invites
  for insert to authenticated
  with check (
    public.is_group_admin(group_id)
    and created_by = (select auth.uid())
    and use_count = 0
  );

create policy "invites_update_admin" on public.invites
  for update to authenticated
  using (public.is_group_admin(group_id))
  with check (public.is_group_admin(group_id));

create policy "invites_delete_admin" on public.invites
  for delete to authenticated
  using (public.is_group_admin(group_id));

-- จำกัดคอลัมน์ที่ UPDATE ได้
revoke update on public.invites from authenticated;
grant update (expires_at, max_uses, revoked_at) on public.invites to authenticated;

-- เข้ากลุ่มด้วย code: ตรวจเงื่อนไขทั้งหมดแล้วใส่เป็น member เท่านั้น
create function public.join_group(p_code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  inv public.invites%rowtype;
  inserted_rows integer;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  -- ล็อกแถวกันสองคนใช้ที่สุดท้ายพร้อมกัน
  select * into inv from public.invites where code = p_code for update;

  if not found
     or inv.revoked_at is not null
     or (inv.expires_at is not null and inv.expires_at <= now())
     or (inv.max_uses is not null and inv.use_count >= inv.max_uses) then
    raise exception 'invalid or expired invite';
  end if;

  insert into public.memberships (group_id, user_id, role)
  values (inv.group_id, uid, 'member')
  on conflict do nothing;
  get diagnostics inserted_rows = row_count;

  -- นับ use_count เฉพาะเมื่อเพิ่งเข้าจริง (เป็นสมาชิกอยู่แล้วคืนกลุ่มเดิมเฉยๆ)
  if inserted_rows > 0 then
    update public.invites set use_count = use_count + 1 where id = inv.id;
  end if;

  return inv.group_id;
end;
$$;

revoke execute on function public.join_group(text) from public, anon;
grant execute on function public.join_group(text) to authenticated;

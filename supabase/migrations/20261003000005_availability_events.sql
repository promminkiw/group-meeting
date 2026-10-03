-- ก้อนที่ 5: availability_slots และ events

-- เวลาว่างผูกกับ user (กรอกครั้งเดียวใช้ทุกกลุ่ม) timezone ถือเป็น Asia/Bangkok
create table public.availability_slots (
  user_id uuid not null references public.profiles (id) on delete cascade,
  -- 0 = จันทร์ ... 6 = อาทิตย์
  day_of_week smallint not null check (day_of_week between 0 and 6),
  -- ช่องละ 30 นาที: 0 = 00:00-00:30 ... 47 = 23:30-24:00
  slot_index smallint not null check (slot_index between 0 and 47),
  primary key (user_id, day_of_week, slot_index)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create index events_group_starts_idx on public.events (group_id, starts_at);

alter table public.availability_slots enable row level security;
alter table public.events enable row level security;

-- availability_slots: เห็นของตัวเองและคนในกลุ่มเดียวกัน แก้ได้เฉพาะของตัวเอง
create policy "availability_slots_select" on public.availability_slots
  for select to authenticated
  using (user_id = (select auth.uid()) or public.shares_group_with(user_id));

create policy "availability_slots_insert_own" on public.availability_slots
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "availability_slots_delete_own" on public.availability_slots
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- ไม่มี UPDATE: เปลี่ยนเวลาว่างด้วยการลบแล้วเพิ่มใหม่
revoke update on public.availability_slots from authenticated;

-- events: สมาชิกอ่านได้ admin จัดการได้
create policy "events_select" on public.events
  for select to authenticated
  using (public.is_group_member(group_id));

create policy "events_insert_admin" on public.events
  for insert to authenticated
  with check (
    public.is_group_admin(group_id)
    and created_by = (select auth.uid())
  );

create policy "events_update_admin" on public.events
  for update to authenticated
  using (public.is_group_admin(group_id))
  with check (public.is_group_admin(group_id));

create policy "events_delete_admin" on public.events
  for delete to authenticated
  using (public.is_group_admin(group_id));

-- จำกัดคอลัมน์ที่ UPDATE ได้ (group_id, created_by แก้ไม่ได้)
revoke update on public.events from authenticated;
grant update (title, description, starts_at, ends_at) on public.events to authenticated;

-- ก้อนที่ 4: tasks และ task_assignees

create type public.task_status as enum ('todo', 'doing', 'done');

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  description text,
  deadline timestamptz,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- สถานะเก็บรายคน เพื่อตอบได้ว่าใครค้างอะไร
create table public.task_assignees (
  task_id uuid not null references public.tasks (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status public.task_status not null default 'todo',
  assigned_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (task_id, user_id)
);

create index tasks_group_deadline_idx on public.tasks (group_id, deadline);
create index task_assignees_user_status_idx on public.task_assignees (user_id, status);

alter table public.tasks enable row level security;
alter table public.task_assignees enable row level security;

-- หา group ของงาน (security definer เพื่อไม่ให้ policy ซ้อนกัน)
create function public.task_group_id(tid uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select group_id from public.tasks where id = tid;
$$;

revoke execute on function public.task_group_id(uuid) from public, anon;
grant execute on function public.task_group_id(uuid) to authenticated;

-- tasks: สมาชิกอ่านได้ admin จัดการได้
create policy "tasks_select" on public.tasks
  for select to authenticated
  using (public.is_group_member(group_id));

create policy "tasks_insert_admin" on public.tasks
  for insert to authenticated
  with check (
    public.is_group_admin(group_id)
    and created_by = (select auth.uid())
  );

create policy "tasks_update_admin" on public.tasks
  for update to authenticated
  using (public.is_group_admin(group_id))
  with check (public.is_group_admin(group_id));

create policy "tasks_delete_admin" on public.tasks
  for delete to authenticated
  using (public.is_group_admin(group_id));

-- task_assignees
create policy "task_assignees_select" on public.task_assignees
  for select to authenticated
  using (public.is_group_member(public.task_group_id(task_id)));

create policy "task_assignees_insert_admin" on public.task_assignees
  for insert to authenticated
  with check (public.is_group_admin(public.task_group_id(task_id)));

-- แก้ได้เฉพาะแถวของตัวเอง (และเฉพาะคอลัมน์ status ตาม grant ด้านล่าง)
create policy "task_assignees_update_own" on public.task_assignees
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "task_assignees_delete_admin" on public.task_assignees
  for delete to authenticated
  using (public.is_group_admin(public.task_group_id(task_id)));

-- จำกัดคอลัมน์ที่ UPDATE ได้ (group_id, created_by ของงานแก้ไม่ได้)
revoke update on public.tasks from authenticated;
grant update (title, description, deadline) on public.tasks to authenticated;

revoke update on public.task_assignees from authenticated;
grant update (status) on public.task_assignees to authenticated;

-- ผู้ถูกมอบหมายต้องเป็นสมาชิกของกลุ่มที่งานนั้นอยู่
create function public.check_assignee_in_group()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.tasks t
    join public.memberships m on m.group_id = t.group_id
    where t.id = new.task_id and m.user_id = new.user_id
  ) then
    raise exception 'assignee must be a member of the task group';
  end if;
  return new;
end;
$$;

create trigger task_assignees_check_member
  before insert on public.task_assignees
  for each row execute function public.check_assignee_in_group();

-- สมาชิกออก/ถูกลบ: เอางานที่ได้รับมอบหมายในกลุ่มนั้นออก (cascade ลบกลุ่ม = ไม่มีแถวให้ลบ ไม่พัง)
create function public.remove_assignments_on_member_leave()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.task_assignees ta
  using public.tasks t
  where ta.task_id = t.id
    and t.group_id = old.group_id
    and ta.user_id = old.user_id;
  return old;
end;
$$;

create trigger memberships_remove_assignments
  after delete on public.memberships
  for each row execute function public.remove_assignments_on_member_leave();

-- อัปเดต updated_at อัตโนมัติ
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

create trigger task_assignees_set_updated_at
  before update on public.task_assignees
  for each row execute function public.set_updated_at();

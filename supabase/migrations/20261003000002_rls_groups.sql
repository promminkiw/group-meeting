-- ก้อนที่ 2: helper function, RLS ของ profiles/groups/memberships, create_group

-- helper: security definer เพื่อไม่ให้ RLS ของ memberships วนซ้ำตัวเอง
create function public.is_group_member(gid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.memberships
    where group_id = gid and user_id = (select auth.uid())
  );
$$;

create function public.is_group_admin(gid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.memberships
    where group_id = gid and user_id = (select auth.uid()) and role = 'admin'
  );
$$;

-- เป็นสมาชิกกลุ่มเดียวกันอย่างน้อยหนึ่งกลุ่มหรือไม่
create function public.shares_group_with(other_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships mine
    join public.memberships theirs on theirs.group_id = mine.group_id
    where mine.user_id = (select auth.uid()) and theirs.user_id = other_user
  );
$$;

-- ให้เรียกได้เฉพาะคนที่ login แล้ว
revoke execute on function public.is_group_member(uuid) from public, anon;
revoke execute on function public.is_group_admin(uuid) from public, anon;
revoke execute on function public.shares_group_with(uuid) from public, anon;
grant execute on function public.is_group_member(uuid) to authenticated;
grant execute on function public.is_group_admin(uuid) to authenticated;
grant execute on function public.shares_group_with(uuid) to authenticated;

-- profiles: เห็นตัวเองและคนในกลุ่มเดียวกัน แก้ได้เฉพาะของตัวเอง
create policy "profiles_select" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or public.shares_group_with(id));

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- จำกัดคอลัมน์ที่ UPDATE ได้
revoke update on public.profiles from authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;

revoke update on public.groups from authenticated;
grant update (name, description) on public.groups to authenticated;

revoke update on public.memberships from authenticated;
grant update (role) on public.memberships to authenticated;

-- groups: ไม่มี insert ตรง (ใช้ create_group)
create policy "groups_select" on public.groups
  for select to authenticated
  using (public.is_group_member(id));

create policy "groups_update_admin" on public.groups
  for update to authenticated
  using (public.is_group_admin(id))
  with check (public.is_group_admin(id));

create policy "groups_delete_admin" on public.groups
  for delete to authenticated
  using (public.is_group_admin(id));

-- memberships: ไม่มี insert ตรง (ใช้ create_group / join_group)
create policy "memberships_select" on public.memberships
  for select to authenticated
  using (public.is_group_member(group_id));

create policy "memberships_update_admin" on public.memberships
  for update to authenticated
  using (public.is_group_admin(group_id))
  with check (public.is_group_admin(group_id));

-- admin ลบสมาชิกได้ และสมาชิกออกจากกลุ่มเองได้
create policy "memberships_delete" on public.memberships
  for delete to authenticated
  using (public.is_group_admin(group_id) or user_id = (select auth.uid()));

-- กันย้ายแถวไปกลุ่ม/คนอื่น และกัน admin คนสุดท้ายหายไป
create function public.guard_memberships_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  losing_admin boolean := false;
begin
  if tg_op = 'UPDATE' and (new.group_id <> old.group_id or new.user_id <> old.user_id) then
    raise exception 'cannot change group_id or user_id of a membership';
  end if;

  if old.role = 'admin' then
    if tg_op = 'DELETE' then
      losing_admin := true;
    else
      losing_admin := new.role <> 'admin';
    end if;
  end if;

  if losing_admin then
    -- ล็อกแถวกลุ่มเพื่อ serialize การออก/ลดสิทธิ์ admin พร้อมกัน (no key update ไม่ชนกับ insert membership)
    perform 1 from public.groups where id = old.group_id for no key update;

    -- ไม่พบกลุ่ม = กำลังลบกลุ่ม (cascade) จึงข้ามการตรวจ
    if found
       and not exists (
         select 1 from public.memberships
         where group_id = old.group_id and role = 'admin' and user_id <> old.user_id
       ) then
      raise exception 'a group must keep at least one admin';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger memberships_guard
  before update or delete on public.memberships
  for each row execute function public.guard_memberships_change();

-- สร้างกลุ่มและใส่ผู้สร้างเป็น admin ในขั้นตอนเดียว
create function public.create_group(p_name text, p_description text default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  new_group_id uuid;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  insert into public.groups (name, description, created_by)
  values (p_name, p_description, uid)
  returning id into new_group_id;

  insert into public.memberships (group_id, user_id, role)
  values (new_group_id, uid, 'admin');

  return new_group_id;
end;
$$;

revoke execute on function public.create_group(text, text) from public, anon;
grant execute on function public.create_group(text, text) to authenticated;

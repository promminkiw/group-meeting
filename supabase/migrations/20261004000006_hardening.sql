-- ก้อนที่ 6: ปิดช่องจากการรีวิว
-- 1) จำกัดความยาวข้อความใน DB ให้ตรงกับ validation ฝั่งแอป (REST/RPC เรียกตรงด้วย anon key ข้ามแอปได้)
-- 2) avatar_url ต้องเป็น https เท่านั้น
-- 3) ลบบัญชีได้: created_by เป็น null เมื่อผู้สร้างถูกลบ และกลุ่มที่บัญชีนั้นเป็น admin คนเดียวถูกลบทิ้ง

-- ===== 1) ความยาวข้อความ =====
alter table public.groups
  add constraint groups_description_length check (char_length(description) <= 500);
alter table public.tasks
  add constraint tasks_description_length check (char_length(description) <= 2000);
alter table public.events
  add constraint events_description_length check (char_length(description) <= 2000);
alter table public.invites
  add constraint invites_code_max_length check (char_length(code) <= 64);

-- ===== 2) avatar_url =====
-- ล้างค่าเดิมที่ไม่ผ่านก่อน ไม่งั้น add constraint จะล้ม
update public.profiles set avatar_url = null where avatar_url !~ '^https://';

alter table public.profiles
  add constraint profiles_avatar_url_https check (avatar_url ~ '^https://' and char_length(avatar_url) <= 2048);

-- metadata ตอนสมัครผู้ใช้ใส่เองได้ ต้องกรองก่อน insert ไม่งั้น constraint ทำให้สมัครไม่ได้
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_avatar text := new.raw_user_meta_data ->> 'avatar_url';
begin
  if v_avatar !~ '^https://' or char_length(v_avatar) > 2048 then
    v_avatar := null;
  end if;

  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    -- ตัดที่ 80 และ trim เพื่อไม่ให้ check constraint ทำ insert ล้ม
    coalesce(
      nullif(left(btrim(coalesce(
        nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
        nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
        split_part(new.email, '@', 1)
      )), 80), ''),
      'user'
    ),
    v_avatar
  );
  return new;
end;
$$;

-- ===== 3) ลบบัญชีได้ =====
alter table public.groups alter column created_by drop not null;
alter table public.groups drop constraint groups_created_by_fkey;
alter table public.groups
  add constraint groups_created_by_fkey foreign key (created_by) references public.profiles (id) on delete set null;

alter table public.invites alter column created_by drop not null;
alter table public.invites drop constraint invites_created_by_fkey;
alter table public.invites
  add constraint invites_created_by_fkey foreign key (created_by) references public.profiles (id) on delete set null;

alter table public.tasks alter column created_by drop not null;
alter table public.tasks drop constraint tasks_created_by_fkey;
alter table public.tasks
  add constraint tasks_created_by_fkey foreign key (created_by) references public.profiles (id) on delete set null;

alter table public.events alter column created_by drop not null;
alter table public.events drop constraint events_created_by_fkey;
alter table public.events
  add constraint events_created_by_fkey foreign key (created_by) references public.profiles (id) on delete set null;

-- รันก่อน cascade ลบ memberships: ถ้าปล่อยให้ cascade ไปถึง guard จะโดน 'a group must keep at least one admin'
-- กลุ่มที่ยังมี admin คนอื่นอยู่ไม่ถูกแตะ และ guard ยังทำงานตามเดิมกับการออก/ลดสิทธิ์ปกติ
create function public.delete_sole_admin_groups()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.groups g
  where exists (
      select 1 from public.memberships m
      where m.group_id = g.id and m.user_id = old.id and m.role = 'admin'
    )
    and not exists (
      select 1 from public.memberships m
      where m.group_id = g.id and m.role = 'admin' and m.user_id <> old.id
    );
  return old;
end;
$$;

create trigger profiles_delete_sole_admin_groups
  before delete on public.profiles
  for each row execute function public.delete_sole_admin_groups();

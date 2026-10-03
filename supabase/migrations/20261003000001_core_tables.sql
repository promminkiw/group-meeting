-- ก้อนที่ 1: ตารางหลัก profiles / groups / memberships

create type public.member_role as enum ('admin', 'member');

-- ข้อมูลสาธารณะของ user (auth.users ฝั่ง client เข้าถึงไม่ได้)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  description text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

-- junction table ของ many-to-many ระหว่าง user กับ group
create table public.memberships (
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.member_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- ใช้ตอน query "กลุ่มทั้งหมดของ user นี้"
create index memberships_user_id_idx on public.memberships (user_id);

-- เปิด RLS ทันที: ยังไม่มี policy = ปฏิเสธทุกอย่าง
alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.memberships enable row level security;

-- สร้าง profile อัตโนมัติเมื่อมี user สมัคร (ชื่อจาก Google ถ้ามี ไม่งั้นใช้หน้า @)
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
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
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

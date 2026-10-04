-- ก้อนที่ 7: กัน race ระหว่างลบบัญชีกับ admin อีกคนออกจากกลุ่มพร้อมกัน
-- เดิม delete_sole_admin_groups ไม่ล็อก groups: ถ้า admin อีกคนออกในจังหวะเดียวกัน ทั้งสองฝั่งเห็นว่ายังมี admin อีกคน
-- จึงไม่มีใครลบกลุ่ม และเหลือกลุ่มที่ไม่มี admin
-- ล็อกแถว groups เดียวกับที่ guard_memberships_change ล็อก ทำให้สองฝั่งรอกันและฝั่งที่มาทีหลังเห็นข้อมูลล่าสุด

create or replace function public.delete_sole_admin_groups()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform 1 from public.groups g
  where exists (
    select 1 from public.memberships m
    where m.group_id = g.id and m.user_id = old.id and m.role = 'admin'
  )
  order by g.id
  for update;

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

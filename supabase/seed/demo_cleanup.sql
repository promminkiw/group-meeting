-- ลบข้อมูลตัวอย่างจาก demo_data.sql: วางทั้งไฟล์ใน Supabase SQL Editor แล้วรัน
-- เวลาว่างของบัญชี Google เจ้าของกลุ่มจะถูกลบด้วย เพราะแยกไม่ได้ว่าช่องไหนมาจาก seed

begin;

-- ลบกลุ่มก่อน: tasks, events, memberships หายตาม cascade
delete from public.groups where id = 'd0000000-0000-4000-8000-000000000100';

-- profiles และ availability_slots ของสมาชิกสมมติหายตาม cascade
delete from auth.users where id in (
  'd0000000-0000-4000-8000-000000000001',
  'd0000000-0000-4000-8000-000000000002',
  'd0000000-0000-4000-8000-000000000003',
  'd0000000-0000-4000-8000-000000000004',
  'd0000000-0000-4000-8000-000000000005'
);

delete from public.availability_slots
where user_id in (select user_id from auth.identities where provider = 'google');

commit;

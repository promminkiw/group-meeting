-- ลบข้อมูลตัวอย่างจาก demo_data.sql: วางทั้งไฟล์ใน Supabase SQL Editor แล้วรัน
-- เวลาว่างของบัญชีเจ้าของกลุ่ม demo จะถูกลบด้วย เพราะแยกไม่ได้ว่าช่องไหนมาจาก seed

begin;

-- หาเจ้าของจาก groups.created_by จึงต้องทำก่อนลบกลุ่ม; ไม่ใช้ auth.identities เพราะจะลบของผู้ใช้ Google คนอื่นด้วย
delete from public.availability_slots
where user_id = (select created_by from public.groups where id = 'd0000000-0000-4000-8000-000000000100');

-- tasks, events, memberships หายตาม cascade
delete from public.groups where id = 'd0000000-0000-4000-8000-000000000100';

-- profiles และ availability_slots ของสมาชิกสมมติหายตาม cascade
delete from auth.users where id in (
  'd0000000-0000-4000-8000-000000000001',
  'd0000000-0000-4000-8000-000000000002',
  'd0000000-0000-4000-8000-000000000003',
  'd0000000-0000-4000-8000-000000000004',
  'd0000000-0000-4000-8000-000000000005'
);

commit;

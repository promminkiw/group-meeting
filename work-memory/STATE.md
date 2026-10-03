# STATE
Updated: 2026-10-03
Goal: เว็บแอปจัดการงานและนัดเวลาสำหรับกลุ่มนักศึกษา ใช้งานได้จริงและ deploy บน Vercel (portfolio)

## Next
- [ ] `next` commit โค้ดเฟส 3-5 + redesign + README (ยังไม่ได้ commit ทั้งหมด) แล้วหยุด dev server รัน `npm run build` ตรวจครั้งสุดท้าย
- [ ] ตรวจหน้าตาบนมือถือ (375px) ทุกหน้า: ยังไม่เคยดูจริง (ย่อหน้าต่าง Chrome ผ่านเครื่องมือไม่ได้)
- [ ] สร้าง src/app/not-found.tsx ระดับ root ให้ตรงดีไซน์ (ตอนนี้ 404 เป็นหน้า default ของ Next)
- [ ] ตั้งค่า Google OAuth: ผู้ใช้ขอให้ "พาทำทีละช่วง" ในวันที่ 2026-10-04 (ยังไม่เริ่ม) ลำดับ 4 ช่วง: (1) Supabase เปิด provider Google แล้วคัดลอก Callback URL (2) Google Cloud สร้างโปรเจกต์ + OAuth consent (เพิ่มอีเมลผู้ทดสอบ) (3) สร้าง OAuth client Web application ใส่ origin http://localhost:3000 และ redirect URI = Callback URL ได้ Client ID/secret (4) วางลง Supabase แล้วทดสอบที่ /login ห้ามให้ส่ง Client secret ในแชต
- [ ] ถ่าย screenshot ลง README (dashboard, รายการงาน, heatmap, กรอกเวลาว่าง, มือถือ)
- [ ] deploy Vercel (ตั้ง SITE_URL, Redirect URL, เปิด Confirm email กลับ)
- [ ] ตัดสินใจเรื่อง RPC: dashboard aggregate ใน DB, createTask/saveAvailability แบบ atomic, getClaims() ใน proxy
- [ ] อธิบายแนวคิดที่ยังไม่ได้สอนก่อนทำ (Server vs Client Components, กริดเวลา, slot -> เวลาจริง)

## Done
- [x] เฟส 0 scaffold (commit 17946cd)
- [x] เฟส 1 migrations 000001-000005 + rls_smoke.sql รันบน Supabase แล้ว 77 pass
- [x] เฟส 2 auth (email); ทดสอบ login จริงผ่าน
- [x] เฟส 3-5 กลุ่ม/สิทธิ์, งาน+dashboard, ปฏิทิน (ยังไม่ commit) ทดสอบในเบราว์เซอร์ด้วยบัญชีทดสอบ admin+member ผ่าน
- [x] falcon review เฟส 2-4 แล้วแก้ 11 ข้อ; 222 unit test ผ่าน

- [x] redesign UI 4 รอบ ตาม work-memory/DESIGN.md (อินดิโก + IBM Plex Sans Thai, app shell, lucide-react); 227 test ผ่าน; ตรวจในเบราว์เซอร์เดสก์ท็อปแล้ว

## Blocked
- Google OAuth: ต้องให้เจ้าของโปรเจกต์ตั้งค่าเอง
- ไม่มี screenshot: ต้องถ่ายจากแอปจริง

## Learned
- ห้ามรัน `next build` ตอน `next dev` เปิดอยู่ (ใช้ .next ร่วมกัน) ทำให้ route ใหม่ 404; แก้ด้วยหยุด dev, ลบ .next, รันใหม่
- เบราว์เซอร์โหมดมืดทำให้ตัวอักษรในการ์ดพื้นขาวมองไม่เห็น จึงบังคับ color-scheme: light
- ห้ามสร้างบัญชี/กรอกรหัสผ่านผ่านเครื่องมือเบราว์เซอร์ที่ต่อ Supabase คลาวด์ ผู้ใช้ต้องสมัครบัญชีทดสอบเอง
- ห้ามส่งฟังก์ชัน/ไอคอน (component) เป็น prop จาก Server Component ไป Client Component: พังตอน runtime แต่ tsc/lint/test จับไม่ได้ ต้องเปิดหน้าจริงตรวจ
- form_input ติ๊ก checkbox ไม่อัปเดต React state ใช้ left_click แทน
- บัญชีทดสอบ (Admin, User) และกลุ่ม "ชมรมทดสอบ" อยู่ใน Supabase จริง ควรลบหลังเสร็จ

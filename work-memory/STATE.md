# STATE
Updated: 2026-10-04
Goal: เว็บแอปจัดการงานและนัดเวลาสำหรับกลุ่มนักศึกษา ใช้งานได้จริงและ deploy บน Vercel (portfolio)

## Next
- [ ] `next` commit screenshot + seed + README (ผู้ใช้จะ commit เอง)
- [ ] deploy Vercel (ตั้ง SITE_URL, เพิ่ม https://<โดเมน vercel>/** ใน Supabase Redirect URLs, เปิด Confirm email กลับ, Google consent ยังเป็น Testing: login ได้เฉพาะ Test users จนกว่าจะ Publish app)
- [ ] ตัดสินใจเรื่อง push: repo GitHub origin (promminkiw/group-meeting) ว่างเปล่า ไม่มี branch เลย, main ในเครื่องยังผูก upstream origin/main ที่หายไปแล้ว (Vercel ต้องใช้ repo บน GitHub)
- [ ] ตัดสินใจเรื่อง RPC: dashboard aggregate ใน DB, createTask/saveAvailability แบบ atomic, getClaims() ใน proxy
- [ ] อธิบายแนวคิดที่ยังไม่ได้สอนก่อนทำ (Server vs Client Components, กริดเวลา, slot -> เวลาจริง)

## Done
- [x] เฟส 0 scaffold (commit 17946cd)
- [x] เฟส 1 migrations 000001-000005 + rls_smoke.sql รันบน Supabase แล้ว 77 pass
- [x] เฟส 2 auth (email); ทดสอบ login จริงผ่าน
- [x] เฟส 3-5 กลุ่ม/สิทธิ์, งาน+dashboard, ปฏิทิน ทดสอบในเบราว์เซอร์ด้วยบัญชีทดสอบ admin+member ผ่าน
- [x] falcon review เฟส 2-4 แล้วแก้ 11 ข้อ; 222 unit test ผ่าน

- [x] redesign UI 4 รอบ ตาม work-memory/DESIGN.md (อินดิโก + IBM Plex Sans Thai, app shell, lucide-react); 227 test ผ่าน; ตรวจในเบราว์เซอร์เดสก์ท็อปแล้ว
- [x] commit เฟส 3-5 + redesign + README (4656a4d)
- [x] 2026-10-04 ตรวจ 375px: /, ภาพรวมกลุ่ม, tasks, calendar, availability, members, join ไม่ล้นจอแนวนอน, bottom nav ใช้ได้
- [x] 2026-10-04 แก้ bug หน้าเวลาว่างพื้นที่ว่าง ~1200px (เพิ่ม relative ที่ availability-grid.tsx) ตรวจแล้ว docH 2284 -> 1106; ยังไม่ commit
- [x] 2026-10-04 404 ของ tasks/new, tasks/[taskId] หายหลังหยุด dev + ลบ .next ตรวจ 375px ผ่าน
- [x] 2026-10-04 Google OAuth ใช้งานได้ ผู้ใช้ทดสอบ login ผ่าน (Supabase provider Google + Redirect URL http://localhost:3000/**; Google Cloud โปรเจกต์ group-meeting, client group-meeting-web)
- [x] 2026-10-04 /login /signup ที่ 375px ผ่าน (ตรวจด้วย iframe credentialless ไม่ต้อง logout)
- [x] 2026-10-04 ผู้ใช้ commit เอง: 323afac (fix availability grid), 594031a (STATE)
- [x] 2026-10-04 สร้าง src/app/not-found.tsx (commit d8785d1)
- [x] 2026-10-04 seed ข้อมูลตัวอย่าง supabase/seed/demo_data.sql (ผู้ใช้รันแล้ว; หาเจ้าของจาก auth.identities provider google = Kariwqq) + demo_cleanup.sql
- [x] 2026-10-04 screenshot 5 ภาพใน docs/screenshots (dashboard, tasks, calendar-heatmap, availability, mobile) + README ส่วน Screenshot; ล้างเวลาว่างเดิมของ Kariwqq (ส-อา ทั้งวัน) แล้วใส่ชุดของ seed 58 ช่อง ถ่าย availability + heatmap ใหม่
- [x] 2026-10-04 build ผ่าน (Next 16.3.8, 13 route), 227 test ผ่าน, lint ไม่มี error

## Blocked
- ไม่มี screenshot: ต้องถ่ายจากแอปจริง

## Learned
- รัน `next build` แล้วค่อยเปิด `next dev` ก็ยังทำให้บาง route 404 ได้ (เจอ 2026-10-04) ควรลบ .next หลัง build ทุกครั้งก่อน dev
- ห้ามรัน `next build` ตอน `next dev` เปิดอยู่ (ใช้ .next ร่วมกัน) ทำให้ route ใหม่ 404; แก้ด้วยหยุด dev, ลบ .next, รันใหม่
- เบราว์เซอร์โหมดมืดทำให้ตัวอักษรในการ์ดพื้นขาวมองไม่เห็น จึงบังคับ color-scheme: light
- ห้ามสร้างบัญชี/กรอกรหัสผ่านผ่านเครื่องมือเบราว์เซอร์ที่ต่อ Supabase คลาวด์ ผู้ใช้ต้องสมัครบัญชีทดสอบเอง
- ห้ามส่งฟังก์ชัน/ไอคอน (component) เป็น prop จาก Server Component ไป Client Component: พังตอน runtime แต่ tsc/lint/test จับไม่ได้ ต้องเปิดหน้าจริงตรวจ
- form_input ติ๊ก checkbox ไม่อัปเดต React state ใช้ left_click แทน
- บัญชีทดสอบ (Admin, User) และกลุ่ม "ชมรมทดสอบ" อยู่ใน Supabase จริง ควรลบหลังเสร็จ
- resize_window ของ Chrome ย่อ viewport ไม่ได้ (ยัง 1536px) ใช้วิธีแทนหน้า localhost ด้วย iframe กว้าง 375px ผ่าน javascript_tool ได้ผล
- ดูหน้าแบบยังไม่ login ได้โดยไม่ต้อง logout: iframe ที่มี attribute credentialless ไม่ส่ง cookie
- บัญชี Google ที่ใช้ทดสอบ OAuth ถูกสร้างเป็น user ใหม่ใน Supabase ด้วย ควรพิจารณาลบตอนเก็บกวาดข้อมูลทดสอบ
- raw_app_meta_data.provider เก็บแค่ provider แรกที่สมัคร บัญชีอีเมลที่ผูก Google ภายหลังยังเป็น email ต้องดู auth.identities
- ถ่าย screenshot: จอ Chrome สูงแค่ 639px ใช้ document.documentElement.style.zoom='0.8' + zoom region [340,0,1180,639] save_to_disk ได้ภาพ 1050x799; ซ่อน dev indicator ด้วย nextjs-portal{display:none}
- SQL Editor ของ Supabase อาจมีข้อความค้างในช่อง ทำให้ syntax error (บรรทัดไม่ตรง) ให้ผู้ใช้ Ctrl+A ลบก่อนวาง
- หลัง navigate คำสั่ง scroll ครั้งแรกอาจถูก reset (hydration) ให้สั่ง scroll ซ้ำในคำสั่งแยกก่อนถ่าย

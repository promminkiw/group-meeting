# STATE
Updated: 2026-10-04
Goal: เว็บแอปจัดการงานและนัดเวลาสำหรับกลุ่มนักศึกษา ใช้งานได้จริงและ deploy บน Vercel (portfolio)

## Next
- [ ] `next` ปิดงานรอบสุดท้าย (แก้แล้ว 2026-10-04 ยังไม่ commit) เหลือ:
  - ผู้ใช้: รัน migration 000007, commit + push แก้ CI (run แรกของ e69038c ล้มที่ tsc เพราะไม่มี next typegen แก้แล้วยืนยันใน clone สะอาด) แล้วดู CI เขียว (email template ข้ามไป: แก้ไม่ได้เพราะไม่มี custom SMTP ผู้ใช้เลือกข้าม 2026-10-04 README บันทึกเป็นข้อจำกัดแล้ว)
  - ตรวจในเบราว์เซอร์ (ต้อง login): ลูกศรในกริดเวลาว่าง/heatmap, ปุ่ม sm บนมือถือ, confirm ยกเลิกลิงก์เชิญ
  - ทดสอบบนเว็บจริง: ลิงก์เชิญ -> สมัครอีเมล -> ยืนยันในเบราว์เซอร์เดียวกัน -> กลับมาหน้า join (ข้ามอุปกรณ์ต้องได้ข้อความ error=confirm ให้ login เอง)
- [ ] เก็บกวาดบัญชีทดสอบใน Supabase จริง: Admin, User, กลุ่ม "ชมรมทดสอบ", บัญชี Google ที่สร้างตอนทดสอบ OAuth, บัญชีอีเมลที่สมัครทดสอบบน Vercel (B4) ระวังอย่าลบ Kariwqq ที่เป็นเจ้าของข้อมูล demo (ทำหลังรัน migration 000006 เพราะก่อนหน้านั้นลบบัญชีที่สร้างกลุ่มไม่ได้)
- [ ] เลื่อนไว้จากรีวิว: app rate limit login/signup (ต้องใช้บริการภายนอก), CSP เต็ม (form-action 'self' จะบล็อก redirect ไป Google), จำกัดจำนวนกลุ่มต่อ user, task_assignees race, ban list หลัง kick, task_group_id เป็น RPC, RLS ต่อแถวช้า (ต้องวัด), ความหมาย status filter
- [ ] ตัดสินใจเรื่อง RPC: dashboard aggregate ใน DB, createTask/saveAvailability แบบ atomic, getClaims() ใน proxy
- [ ] อธิบายแนวคิดที่ยังไม่ได้สอนก่อนทำ (Server vs Client Components, กริดเวลา, slot -> เวลาจริง)

## Done
- [x] 2026-10-04 ปิดงานตามรีวิวรวม 5 agent + dragon (ยังไม่ commit): /auth/confirm (verifyOtp token_hash + fallback code), signUp emailRedirectTo -> /auth/confirm, ข้อความ login error=auth/confirm (hasOwn), ปุ่ม sm max-md:min-h-11, confirm ยกเลิกลิงก์เชิญ, focus + role=alert ตอนรหัสไม่ตรง (FieldMessage error มี role=alert ทุกฟอร์ม), ปุ่มตา label คงที่, ariaLabel ใน PendingButton (ลบนัดหมาย/ลบออกจากกลุ่ม/ลบออกจากงาน), คำไทย "เอาออก" -> "ลบออกจากงาน", legend heatmap, ปุ่มทั้งวัน/ล้าง min-h-8 text-xs, roving tabindex ลูกศรในกริด (lib/availability/grid-navigation.ts + use-roving-grid.ts), migration 000007 lock groups ใน delete_sole_admin_groups, LICENSE MIT, CI .github/workflows/ci.yml, engines node>=22, README (วิธีลองใช้, badge, หัวข้อ 8 hardening, ER created_by nullable, ข้อจำกัด, email template, License); test 257 ผ่าน (+confirm route 7, auth actions 7, proxy 5, grid-navigation 6), tsc/lint ผ่าน, ไม่ได้รัน build เพราะ dev เปิดอยู่; ตรวจเบราว์เซอร์แล้ว: /auth/confirm ไม่มี token -> login?error=confirm&next คงไว้, error=constructor ไม่แสดงอะไร, รหัสไม่ตรง focus ช่องยืนยัน + role=alert
- [x] 2026-10-04 ผู้ใช้รัน migration 000006 + rls_smoke ผ่านหมด, ตั้ง Minimum password length 8
- [x] 2026-10-04 ฟอร์มสมัคร: ช่องยืนยันรหัสผ่าน (เตือนตอนกดสมัคร + server ตรวจซ้ำ), ปุ่มตาทุกช่องรหัสผ่าน (components/ui/password-input.tsx), ค่าคงที่ใน lib/auth/password.ts; tsc/lint/232 test/build ผ่าน; ตรวจในเบราว์เซอร์เดสก์ท็อปแล้ว (ปุ่มตาสลับ type + aria-label, เตือนไม่ตรงไม่ส่งฟอร์ม, ข้อความหายเมื่อแก้, login มีปุ่มตา, ไม่มี console error) ยังไม่ได้ตรวจ 375px; commit 67f70d2
- [x] เฟส 0 scaffold (commit 17946cd)
- [x] เฟส 1 migrations 000001-000005 + rls_smoke.sql รันบน Supabase แล้ว 77 pass
- [x] เฟส 2 auth (email); ทดสอบ login จริงผ่าน
- [x] เฟส 3-5 กลุ่ม/สิทธิ์, งาน+dashboard, ปฏิทิน ทดสอบในเบราว์เซอร์ด้วยบัญชีทดสอบ admin+member ผ่าน
- [x] falcon review เฟส 2-4 แล้วแก้ 11 ข้อ; 222 unit test ผ่าน

- [x] redesign UI 4 รอบ ตาม work-memory/DESIGN.md (อินดิโก + IBM Plex Sans Thai, app shell, lucide-react); 227 test ผ่าน; ตรวจในเบราว์เซอร์เดสก์ท็อปแล้ว
- [x] commit เฟส 3-5 + redesign + README (4656a4d)
- [x] 2026-10-04 ตรวจ 375px: /, ภาพรวมกลุ่ม, tasks, calendar, availability, members, join ไม่ล้นจอแนวนอน, bottom nav ใช้ได้
- [x] 2026-10-04 แก้ bug หน้าเวลาว่างพื้นที่ว่าง ~1200px (เพิ่ม relative ที่ availability-grid.tsx) ตรวจแล้ว docH 2284 -> 1106; commit 323afac
- [x] 2026-10-04 404 ของ tasks/new, tasks/[taskId] หายหลังหยุด dev + ลบ .next ตรวจ 375px ผ่าน
- [x] 2026-10-04 Google OAuth ใช้งานได้ ผู้ใช้ทดสอบ login ผ่าน (Supabase provider Google + Redirect URL http://localhost:3000/**; Google Cloud โปรเจกต์ group-meeting, client group-meeting-web)
- [x] 2026-10-04 /login /signup ที่ 375px ผ่าน (ตรวจด้วย iframe credentialless ไม่ต้อง logout)
- [x] 2026-10-04 ผู้ใช้ commit เอง: 323afac (fix availability grid), 594031a (STATE)
- [x] 2026-10-04 สร้าง src/app/not-found.tsx (commit d8785d1)
- [x] 2026-10-04 seed ข้อมูลตัวอย่าง supabase/seed/demo_data.sql (ผู้ใช้รันแล้ว; หาเจ้าของจาก auth.identities provider google = Kariwqq) + demo_cleanup.sql
- [x] 2026-10-04 screenshot 5 ภาพใน docs/screenshots (dashboard, tasks, calendar-heatmap, availability, mobile) + README ส่วน Screenshot; ล้างเวลาว่างเดิมของ Kariwqq (ส-อา ทั้งวัน) แล้วใส่ชุดของ seed 58 ช่อง ถ่าย availability + heatmap ใหม่
- [x] 2026-10-04 commit 82e7a8d (seed + screenshot + README), 5e23f96 (STATE)
- [x] 2026-10-04 push ขึ้น GitHub แล้ว (git push -u origin main) repo promminkiw/group-meeting เป็น Public; ตรวจแล้วไม่มี .env หรือ secret ใน history
- [x] 2026-10-04 build ผ่าน (Next 16.3.8, 13 route), 227 test ผ่าน, lint ไม่มี error
- [x] 2026-10-04 เพิ่มลิงก์เว็บจริงบนสุดของ README (commit a1dce35)
- [x] 2026-10-04 รีวิว falcon + viper (ไม่มี Critical) แล้วแก้ A/B/C (commit a1dce35 ซึ่งใช้ข้อความ "Update work-memory state" แต่มีโค้ด fix อยู่ push แล้ว ไม่แก้ history; header ตรวจบนเว็บจริงแล้วครบ): demo_cleanup ลบเฉพาะเจ้าของ demo, security headers + poweredByHeader false, นัดกรองด้วย ends_at, key={view} ที่ heatmap, nextSlotDate (+test 5 ข้อ), proxy คง next, signUp emailRedirectTo ผ่าน /auth/callback, รหัสผ่านสมัคร 8 (login ยังรับ 6), migration 000006 (check ความยาว, avatar https, created_by on delete set null, ลบบัญชี admin คนเดียว = ลบกลุ่ม ตามที่ผู้ใช้เลือก), rls_smoke ส่วน 11, README; tsc/lint/232 test/build ผ่าน
- [x] 2026-10-04 deploy Vercel เสร็จ: https://group-meeting-mauve.vercel.app ตั้ง env 3 ตัว (Supabase URL/anon key, SITE_URL), Supabase Site URL + Redirect URL vercel/** + Confirm email เปิด, Google app Publish (In production); ผู้ใช้ทดสอบ login Google + สมัคร/ยืนยันอีเมล + หน้าหลักบน URL จริงผ่าน

## Blocked
- ไม่มี

## Learned
- รัน `next build` แล้วค่อยเปิด `next dev` ก็ยังทำให้บาง route 404 ได้ (เจอ 2026-10-04) ควรลบ .next หลัง build ทุกครั้งก่อน dev
- ห้ามรัน `next build` ตอน `next dev` เปิดอยู่ (ใช้ .next ร่วมกัน) ทำให้ route ใหม่ 404; แก้ด้วยหยุด dev, ลบ .next, รันใหม่
- เบราว์เซอร์โหมดมืดทำให้ตัวอักษรในการ์ดพื้นขาวมองไม่เห็น จึงบังคับ color-scheme: light
- ห้ามสร้างบัญชี/กรอกรหัสผ่านผ่านเครื่องมือเบราว์เซอร์ที่ต่อ Supabase คลาวด์ ผู้ใช้ต้องสมัครบัญชีทดสอบเอง
- ห้ามส่งฟังก์ชัน/ไอคอน (component) เป็น prop จาก Server Component ไป Client Component: พังตอน runtime แต่ tsc/lint/test จับไม่ได้ ต้องเปิดหน้าจริงตรวจ
- form_input ติ๊ก checkbox ไม่อัปเดต React state ใช้ left_click แทน
- resize_window ของ Chrome ย่อ viewport ไม่ได้ (ยัง 1536px) ใช้วิธีแทนหน้า localhost ด้วย iframe กว้าง 375px ผ่าน javascript_tool ได้ผล
- ดูหน้าแบบยังไม่ login ได้โดยไม่ต้อง logout: iframe ที่มี attribute credentialless ไม่ส่ง cookie
- raw_app_meta_data.provider เก็บแค่ provider แรกที่สมัคร บัญชีอีเมลที่ผูก Google ภายหลังยังเป็น email ต้องดู auth.identities
- ถ่าย screenshot: จอ Chrome สูงแค่ 639px ใช้ document.documentElement.style.zoom='0.8' + zoom region [340,0,1180,639] save_to_disk ได้ภาพ 1050x799; ซ่อน dev indicator ด้วย nextjs-portal{display:none}
- SQL Editor ของ Supabase อาจมีข้อความค้างในช่อง ทำให้ syntax error (บรรทัดไม่ตรง) ให้ผู้ใช้ Ctrl+A ลบก่อนวาง
- หลัง navigate คำสั่ง scroll ครั้งแรกอาจถูก reset (hydration) ให้สั่ง scroll ซ้ำในคำสั่งแยกก่อนถ่าย
- Supabase ส่งลิงก์ยืนยันอีเมลไปที่ Site URL (เพราะ signUp ไม่ส่ง emailRedirectTo) ถ้าเปลี่ยนโดเมนต้องแก้ Site URL ด้วย; Google Cloud ไม่ต้องแก้เมื่อเปลี่ยนโดเมน เพราะ redirect ไปที่ Supabase
- frame-ancestors 'none' + X-Frame-Options DENY ทำให้วิธีตรวจ 375px ด้วย iframe ใช้ไม่ได้แล้ว (บล็อกแม้ origin เดียวกัน) ต้องหาวิธีอื่น เช่น DevTools device mode
- form-action 'self' ใน CSP บล็อก redirect หลัง submit ฟอร์มไปโดเมนอื่น (Google OAuth ผ่าน server action) อย่าใส่ถ้าไม่เพิ่มโดเมน Supabase
- ดูหน้าแบบยังไม่ login ด้วย fetch(credentials omit) + document.write แสดงผลได้แต่ React ไม่ hydrate กดอะไรไม่ได้ ต้องให้ผู้ใช้ logout
- dev server compile หน้าใหม่หลังแก้ไฟล์ทำให้หน้า reload กลางการพิมพ์ ฟอร์มว่าง ให้รอหรือ find ใหม่แล้วกรอกซ้ำ
- Supabase ไม่ให้แก้ email template ถ้ายังใช้ SMTP ในตัว (ปุ่ม Source กดไม่ได้) ต้องตั้ง custom SMTP ก่อน
- CI/เครื่องใหม่ต้องรัน `next typegen` ก่อน `tsc --noEmit` ไม่งั้นหา PageProps/LayoutProps ไม่เจอ (ในเครื่องผ่านเพราะมี .next อยู่แล้ว)

# DESIGN.md - สเปกดีไซน์ Group Meeting (redesign)

ผู้เขียน: Panda | ผู้ลงมือ: wolf | ธีมสว่างอย่างเดียว | Tailwind 4 ล้วน + lucide-react | UI ภาษาไทย
กฎใหญ่: คงโครงข้อมูล, server action, route, aria เดิมทั้งหมด เปลี่ยนเฉพาะ markup/class/คอมโพเนนต์ภาพ
ค่าที่ระบุในเอกสารนี้คือค่าตัดสินแล้ว ห้ามเลือกใหม่เอง ที่ไม่ได้ระบุให้ยึดตามคอมโพเนนต์ที่ใกล้ที่สุด

## 1. ทิศทางและบุคลิก

มินิมอลมืออาชีพแบบ Linear/Notion แต่อบอุ่น: พื้นหลังเทาอมฟ้าอ่อนมาก การ์ดขาวเส้นขอบบาง และ "สีเด่นสีเดียว" คืออินดิโก
ใช้อินดิโกเฉพาะจุดที่ต้องการให้ตาไปหยุด (ปุ่มหลัก, เมนู active, ลิงก์, โลโก้, heatmap, focus ring) ที่เหลือเป็นโทน slate

วิธีทำให้ "มีชีวิต" โดยไม่รก:
- พื้นหลังหน้ามี wash บนสุดจางๆ: `bg-[radial-gradient(...)]` ไม่ต้องใช้; ใช้ class `.page-wash` (ดู 2.7) เป็น linear-gradient จาก primary-50 ลงเป็น bg ภายใน 280px
- จังหวะช่องว่าง: ห่างระหว่าง section 32px (`space-y-8`), ภายในการ์ด 20px (`p-5`), หัวข้อ section ชิดเนื้อหา 12px
- น้ำหนักตัวอักษร: ชื่อหน้า 700, หัวข้อ section 600, label 500, เนื้อหา 400 (อย่าใช้ 300)
- เงา: การ์ดใช้ `shadow-card` บางๆ เท่านั้น, hover การ์ดที่กดได้ยกขึ้นเป็น `shadow-pop` + เส้นขอบ primary-200
- micro-interaction: CSS transition เท่านั้น `transition-colors duration-150` (ปุ่ม/ลิงก์), `transition-shadow duration-200` (การ์ด), ปุ่ม active `active:scale-[0.98]`, ห้ามใช้ JS animation/library; ครอบ `motion-reduce:transition-none motion-reduce:transform-none`
- empty state: ไอคอน lucide ใน circle `size-12 rounded-full bg-primary-50 text-primary-600` + หัวข้อ 600 + ประโยคชวนทำ + ปุ่ม (ถ้าทำได้)
- เลขใหญ่ใช้ `tabular-nums` เสมอ; โลโก้เป็นสี่เหลี่ยมมน primary-600 ไอคอน `CalendarCheck` สีขาว

## 2. Design tokens

### 2.1 ฟอนต์
เลือก IBM Plex Sans Thai: อ่านสบายบนจอ ตัวเลขและละตินเข้ากันกับไทยในแฟมิลีเดียว (Prompt เด่นเกินสำหรับ UI ข้อมูลหนาแน่น, Noto Sans Thai จืดกว่า)
weight ที่ใช้: 400, 500, 600, 700 เท่านั้น
`layout.tsx`: ลบ Geist/Geist_Mono ใช้
```ts
import { IBM_Plex_Sans_Thai } from "next/font/google";
const plex = IBM_Plex_Sans_Thai({ subsets: ["thai", "latin"], weight: ["400","500","600","700"], variable: "--font-plex", display: "swap" });
// <html lang="th" className={`${plex.variable} h-full antialiased`}>  <body className="min-h-full bg-bg text-ink font-sans">
```

### 2.2 สี (ใส่ใน globals.css ภายใน `@theme`; ใช้ชื่อ semantic ไม่ใช้ zinc/emerald/red-xxx ของ Tailwind อีก)
```css
@import "tailwindcss";
@theme {
  --font-sans: var(--font-plex), ui-sans-serif, system-ui, sans-serif;
  /* primary (indigo) */
  --color-primary-50:#EEF2FF; --color-primary-100:#E0E7FF; --color-primary-200:#C7D2FE;
  --color-primary-300:#A5B4FC; --color-primary-400:#818CF8; --color-primary-500:#6366F1;
  --color-primary-600:#4F46E5; --color-primary-700:#4338CA; --color-primary-800:#3730A3; --color-primary-900:#312E81;
  /* neutral (slate) */
  --color-bg:#F8FAFC; --color-surface:#FFFFFF; --color-surface-muted:#F1F5F9;
  --color-line:#E2E8F0; --color-line-strong:#CBD5E1;
  --color-ink:#0F172A; --color-ink-muted:#475569; --color-ink-subtle:#64748B;
  /* status: fg / bg / border */
  --color-todo-fg:#334155; --color-todo-bg:#F1F5F9;
  --color-doing-fg:#075985; --color-doing-bg:#E0F2FE;
  --color-done-fg:#166534; --color-done-bg:#DCFCE7;
  --color-overdue-fg:#B91C1C; --color-overdue-bg:#FEE2E2; --color-overdue-line:#FECACA;
  --color-warning-fg:#92400E; --color-warning-bg:#FEF3C7; --color-warning-line:#FDE68A;
  --color-info-fg:#1E40AF; --color-info-bg:#DBEAFE; --color-info-line:#BFDBFE;
  --color-success-solid:#15803D; --color-danger-solid:#B91C1C;
  /* radius / shadow */
  --radius-control:0.5rem; --radius-card:0.75rem; --radius-panel:1rem;
  --shadow-card:0 1px 2px rgb(15 23 42/.05),0 1px 1px rgb(15 23 42/.03);
  --shadow-pop:0 4px 12px -2px rgb(15 23 42/.10),0 2px 4px -2px rgb(15 23 42/.06);
}
:root { color-scheme: light; }
body { font-family: var(--font-sans); line-height: 1.6; background: var(--color-bg); color: var(--color-ink); }
.page-wash { background-image: linear-gradient(180deg,var(--color-primary-50) 0,var(--color-bg) 280px); }
```
(Tailwind 4 สร้าง utility `bg-primary-600`, `text-ink-muted`, `border-line`, `rounded-card`, `shadow-card` จากชื่อข้างบนอัตโนมัติ)

### 2.3 Contrast (คำนวณจริง, ตัวอักษรปกติต้อง >= 4.5)
| คู่ (ตัวอักษร / พื้น) | อัตราส่วน | ผล |
|---|---|---|
| ink #0F172A / surface #FFF | 17.85 | AA |
| ink-muted #475569 / surface | 7.58 ; / bg #F8FAFC 7.24 | AA |
| ink-subtle #64748B / surface | 4.76 ; / bg 4.55 | AA (ขั้นต่ำ ใช้กับ meta/placeholder ขนาด >= 12px เท่านั้น) |
| ขาว / primary-600 (ปุ่มหลัก) | 6.29 ; / primary-700 (hover) 7.90 | AA |
| primary-600 ลิงก์ / ขาว | 6.29 | AA |
| primary-700 / primary-50 (เมนู active) | 7.07 | AA |
| todo-fg / todo-bg | 9.45 | AA |
| doing-fg / doing-bg | 6.59 | AA |
| done-fg / done-bg | 6.49 | AA |
| overdue-fg / overdue-bg | 5.30 ; / ขาว 6.47 | AA |
| warning-fg / warning-bg | 6.37 | AA |
| info-fg / info-bg | 7.15 | AA |
| ขาว / success-solid #15803D | 5.02 ; ขาว / danger-solid 6.47 | AA |
ห้าม: ขาวบน primary-500 (4.47 ไม่ผ่าน) และ ink-subtle บน primary-100/slate-200; ห้ามใช้สี #94A3B8 เป็นตัวอักษร (2.56)

### 2.4 Type scale (ไทย: สระบน/ล่างต้องไม่ถูกตัด ห้าม leading ต่ำกว่า 1.35 และห้าม `truncate` กับ overflow-hidden ที่ line-height แน่น)
| ชื่อ | class | ใช้กับ |
|---|---|---|
| display | `text-2xl sm:text-3xl font-bold leading-[1.35] tracking-tight` | ชื่อหน้า (PageHeader), หัวข้อ auth |
| title | `text-xl font-semibold leading-[1.4]` | ชื่อ section ใหญ่ |
| heading | `text-base font-semibold leading-[1.5]` | หัวการ์ด/section |
| body | `text-sm leading-[1.65]` (14px) ; บนมือถือ input ใช้ `text-base` (16px กัน iOS zoom) | เนื้อหา |
| caption | `text-xs leading-[1.6] text-ink-muted` (12px) | meta, helper |
| stat | `text-3xl font-bold tabular-nums leading-[1.2]` | ตัวเลข StatCard |
`overflow-hidden` ใน badge/pill ห้าม; ใช้ `py-0.5` + `leading-[1.6]` ให้สระไม่ชน

### 2.5 Layout
เนื้อหาหลัก `max-w-5xl` (1024px) `px-4 sm:px-6`; หน้า form/รายละเอียดแคบ `max-w-3xl`; auth/join การ์ด `max-w-md`.
Breakpoint หลักคือ `md` (768px): ต่ำกว่า = มือถือ (bottom nav, list card), ตั้งแต่ md = เดสก์ท็อป (top tabs, table)

### 2.6 Focus ring (ทุก element ที่โต้ตอบได้)
`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600` (ปุ่ม primary บนพื้นเข้ม ใช้ offset-2 เช่นกัน ห้ามลบ outline) ใส่ใน globals.css เป็น rule กลางสำหรับ `a, button, input, select, textarea, summary, [tabindex]`

### 2.7 ที่เก็บไฟล์
คอมโพเนนต์กลางที่ `src/components/ui/` (button.tsx, field.tsx, card.tsx, badge.tsx, stat-card.tsx, page-header.tsx, empty-state.tsx, alert.tsx, skeleton.tsx, avatar.tsx, tabs.tsx, table.tsx, danger-zone.tsx) และ shell ที่ `src/components/shell/` (app-header.tsx, group-nav.tsx, group-switcher.tsx, user-menu.tsx). ย้าย/คง `pending-button.tsx`, `error-panel.tsx`, `page-skeleton.tsx` ให้เป็น wrapper บางๆ ของคอมโพเนนต์ใหม่ (ห้ามทิ้ง export เดิมจนกว่าทุกหน้าย้ายแล้ว)

## 3. App shell

โครง (ทุกหน้าหลัง login ยกเว้น auth): `<AppHeader/>` + `<main class="page-wash min-h-[calc(100dvh-3.5rem)]">`.
ทำ `src/app/groups/layout.tsx` (ใหม่) และใส่ AppHeader ใน `page.tsx` หน้าแรก + `join/[code]/page.tsx` (ไม่ย้ายโฟลเดอร์/route)
AppHeader เป็น server component; ดึง profile + `getMyGroups()` มาส่ง props

AppHeader (`sticky top-0 z-40 h-14 border-b border-line bg-surface/90 backdrop-blur`; ใน `max-w-5xl` flex items-center gap-3):
1. โลโก้: ลิงก์ไป `/` ; สี่เหลี่ยม `size-8 rounded-lg bg-primary-600` ไอคอน `CalendarCheck` ขาว 18px + ชื่อ "Group Meeting" `font-semibold` (ซ่อนข้อความบนจอ < sm)
2. ตัวสลับกลุ่ม (เมื่ออยู่ใน /groups/[id]): ปุ่ม `ChevronsUpDown` + ชื่อกลุ่มปัจจุบัน (max-w-[12rem], `break-words` ได้ 2 บรรทัดห้าม truncate) ใช้ `<details>` + รายการลิงก์กลุ่ม + ลิงก์ "ทุกกลุ่ม" (ไม่ใช้ JS state; ปิดเมื่อเปลี่ยนหน้าโดยให้ `key` ตาม pathname หรือยอมให้ค้างได้ถ้า wolf ปิดไม่ได้ง่าย)
3. ขวาสุด: UserMenu = Avatar + ชื่อ (ซ่อน < sm) ใน `<details>` มีรายการ "ออกจากระบบ" (`LogOut` ไอคอน, เป็น `<form action={signOut}>`); เดสก์ท็อปแสดงปุ่ม ghost "ออกจากระบบ" ตรงๆ ข้าง Avatar (md ขึ้นไป) ไม่ต้องซ่อนในเมนู

GroupHeader (ใน `groups/[groupId]/layout.tsx` เหนือเนื้อหา): ชื่อกลุ่ม display + Badge บทบาท; ไม่มีลิงก์ "← กลุ่มของฉัน" แล้ว (มีใน switcher)
GroupNav เดสก์ท็อป (md+): แท็บแถวเดียว `border-b border-line` ต่อท้าย GroupHeader; แต่ละแท็บ `inline-flex items-center gap-2 px-3 h-11 text-sm font-medium text-ink-muted hover:text-ink border-b-2 border-transparent -mb-px`; active = `text-primary-700 border-primary-600` + `aria-current="page"`
| เมนู | href | ไอคอน lucide | เงื่อนไข |
|---|---|---|---|
| ภาพรวม | /groups/[id] | `LayoutDashboard` | ทุกคน (active เฉพาะ path ตรงเป๊ะ) |
| งาน | /tasks | `ListChecks` | ทุกคน (active เมื่อ startsWith) |
| ปฏิทิน | /calendar | `CalendarDays` | ทุกคน |
| เวลาว่างของฉัน | /availability | `Clock` | can fillAvailability |
| จัดการสมาชิก | /members | `Users` | can manageMembers (admin) |
ต้องเป็น client component (`usePathname`) เพื่อหา active; รับรายการเมนูที่กรองสิทธิ์แล้วเป็น props (server กรอง)
GroupNav มือถือ (< md): `fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur pb-[env(safe-area-inset-bottom)]` grid cols = จำนวนเมนู; แต่ละช่อง `flex flex-col items-center justify-center gap-0.5 min-h-14 text-[11px] font-medium`; ไอคอน 20px; active = `text-primary-700` + แถบ `h-0.5 w-6 bg-primary-600` เหนือไอคอน; ป้าย "เวลาว่างของฉัน" ย่อเป็น "เวลาว่าง" เฉพาะ bottom nav (aria-label เต็ม); `aria-label="เมนูกลุ่ม"` ทั้งสองแบบ (แสดงสลับด้วย `hidden md:flex` / `md:hidden` ใช้ nav ตัวเดียวกันหรือสองตัวก็ได้ แต่ห้าม aria-label ซ้ำที่แสดงพร้อมกัน)
เว้นที่ล่าง: wrapper เนื้อหาในกลุ่ม `pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-10`; แถบ save sticky ของหน้าเวลาว่างบนมือถือต้องอยู่เหนือ bottom nav: `bottom-[calc(3.5rem+env(safe-area-inset-bottom))]`
หน้าแรก/join ไม่มี bottom nav (pb-10)

## 4. คอมโพเนนต์กลาง
สถานะที่ต้องมีทุกตัวที่กดได้: default / hover / focus-visible (กฎ 2.6) / disabled (`opacity-50 cursor-not-allowed` + ห้ามมี hover เปลี่ยนสี) / pending (disabled + `Loader2` ไอคอน `animate-spin` + pendingLabel; ความกว้างปุ่มห้ามเปลี่ยน) / error (เฉพาะ field)

**Button** `variant: primary|secondary|ghost|danger`, `size: sm|md|lg`, `loading?`, `icon?: LucideIcon`, `href?` (render Link), `fullWidth?`
- base: `inline-flex items-center justify-center gap-2 rounded-control font-medium transition-colors duration-150 active:scale-[0.98]`
- size: sm `h-9 px-3 text-sm` ; md `h-10 px-4 text-sm` ; lg `h-11 px-5 text-base` ; มือถือทุกปุ่มที่เป็นการกระทำหลัก min-h 44px (`max-md:min-h-11`)
- primary `bg-primary-600 text-white shadow-card hover:bg-primary-700` ; secondary `bg-surface text-ink border border-line-strong hover:bg-surface-muted` ; ghost `text-ink-muted hover:bg-surface-muted hover:text-ink` ; danger `bg-surface text-overdue-fg border border-overdue-line hover:bg-overdue-bg` (danger-solid `bg-danger-solid text-white` ใช้เฉพาะปุ่มยืนยันลบ)
- `PendingButton` เดิม (label/pendingLabel/variant/className) ต้องคงอยู่โดยห่อ Button + `useFormStatus`

**Field** (Input/Textarea/Select/Checkbox) props: `label, name, helper?, error?, required?` + native props
- label `block text-sm font-medium text-ink mb-1.5`; required ต่อท้าย " *" `aria-hidden` (ใช้ native `required`)
- control: `w-full h-11 md:h-10 rounded-control border border-line-strong bg-surface px-3 text-base md:text-sm text-ink placeholder:text-ink-subtle transition-colors hover:border-ink-subtle focus-visible:border-primary-600 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary-600/30` ; Textarea `min-h-24 py-2 leading-[1.65]` ; Select เพิ่ม `appearance-none` + `ChevronDown` ไอคอนขวา pointer-events-none
- disabled `bg-surface-muted text-ink-subtle cursor-not-allowed`
- error: border `border-danger-solid`, `aria-invalid="true"`, `aria-describedby` ชี้ข้อความ `<p id class="mt-1.5 flex gap-1.5 text-xs text-overdue-fg">` พร้อมไอคอน `AlertCircle` 14px ; helper `mt-1.5 text-xs text-ink-muted` (error แทนที่ helper)
- Checkbox: แถว `flex items-start gap-3 min-h-11`, กล่อง `size-5 rounded accent-primary-600` (ใช้ native + `accent-color`), label คลิกได้ทั้งแถว

**Card** `padding?: sm|md|lg`, `interactive?`, `as?` — `rounded-card border border-line bg-surface shadow-card` ; padding md = `p-5` (มือถือ `p-4`); interactive เพิ่ม `transition-shadow duration-200 hover:shadow-pop hover:border-primary-200` (ทั้งการ์ดเป็น Link ให้ focus ring ที่ Link)
**Badge/StatusPill** `tone: todo|doing|done|overdue|warning|info|primary|neutral`, `icon?`, children
- `inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium` + สี `bg-{tone}-bg text-{tone}-fg`; ข้อความเสมอ + ไอคอน 12px (`aria-hidden`)
- ไอคอนสถานะ: todo `Circle`, doing `Loader` (static ไม่หมุน), done `CheckCircle2`, overdue `AlertTriangle`, "ครบกำหนดวันนี้" (warning) `Clock`, info `Info`; บทบาท: admin `ShieldCheck` (tone primary) / member `User` (tone neutral)
- แทนที่ `StatusBadge`/`DeadlineBadge` ใน `task-badges.tsx` (คง export ชื่อเดิม)
**StatCard** `label, value, tone, icon, href?` — Card `p-4` : แถวบน ไอคอน `size-8 rounded-lg bg-{tone}-bg text-{tone}-fg` + label caption ; ล่าง `stat`; tone overdue ที่ value>0 ให้ value เป็น `text-overdue-fg` และ card `border-overdue-line`; ใช้ `<dl>` ต่อ (dt/dd) เหมือนเดิม
**PageHeader** `title, description?, actions?, backHref?, backLabel?` — `flex flex-wrap items-start justify-between gap-4 pb-6`; title display; description `mt-1 text-sm text-ink-muted max-w-prose`; actions `flex gap-2` ; backHref = ลิงก์ `ArrowLeft` + ข้อความ `text-sm text-ink-muted hover:text-primary-700` เหนือ title
**EmptyState** `icon, title, description?, action?` — `flex flex-col items-center text-center rounded-card border border-dashed border-line-strong bg-surface/60 px-6 py-10`; circle `size-12 rounded-full bg-primary-50 text-primary-600` ไอคอน 22px; title heading `mt-4`; description `mt-1 text-sm text-ink-muted max-w-sm`; action `mt-5`
**ErrorPanel** (คง props เดิม error/retry/backHref/backLabel) — EmptyState ชุดแดง: circle `bg-overdue-bg text-overdue-fg` ไอคอน `AlertTriangle`, หัวข้อ "เกิดข้อผิดพลาด", ปุ่ม primary "ลองใหม่" (`RotateCw`) + secondary กลับ; `role="alert"`; อยู่ในการ์ดกึ่งกลาง `max-w-md py-16`
**Skeleton** `className` — `animate-pulse rounded-control bg-line` ; มี `PageSkeleton` เดิมคง export แต่ทำให้เหมือนโครงจริง: header (บรรทัด 2 + ปุ่ม), grid StatCard 4 ช่อง, การ์ด 3 ใบ; wrapper `aria-busy="true" aria-label="กำลังโหลด"` `motion-reduce:animate-none`
**Table** (md+) `<table>` ใน Card `overflow-hidden p-0`; thead `bg-surface-muted text-xs font-medium text-ink-muted text-left`; th/td `px-4 py-3`; tbody `divide-y divide-line`; แถว `hover:bg-surface-muted/60`; ตัวเลข `tabular-nums text-right`; มือถือสลับเป็น list card (`md:hidden`, Card `p-4` + `<dl>` 2 คอลัมน์) ทุกตารางต้องมี `<caption class="sr-only">`
**Tabs/SegmentedFilter** `items:[{value,label,count?,href}]`, `value` — ใช้ลิงก์ (ไม่ใช้ JS) ใน `inline-flex rounded-control bg-surface-muted p-1 gap-1`; ตัวเลือก `h-9 px-3 rounded-md text-sm font-medium text-ink-muted hover:text-ink`; active `bg-surface text-ink shadow-card` + `aria-current="page"`; เลื่อนแนวนอนได้บนมือถือ (`overflow-x-auto`)
**Alert** `tone: success|error|warning|info`, `title?`, children — `flex gap-3 rounded-card border p-3.5 text-sm` สี `bg-{tone}-bg border-{tone}-line text-{tone}-fg` (success ใช้ done-*; error ใช้ overdue-*); ไอคอน `CheckCircle2 / AlertCircle / AlertTriangle / Info` 18px `mt-0.5`; error=`role="alert"`, อื่นๆ=`role="status"`; ต้องมีข้อความเสมอ ห้าม render เมื่อข้อความว่าง
**Avatar** `name, size: sm(28)|md(36)|lg(48)` — วงกลม `rounded-full font-semibold`; ตัวอักษรย่อ = อักขระแรกของชื่อ (Thai: ข้ามสระนำหน้า เ แ โ ใ ไ แล้วใช้พยัญชนะถัดไป; ละติน uppercase; ถ้ามีช่องว่างใช้ตัวแรกของ 2 คำแรก); สีคงที่: hash ชื่อ mod 6 เลือกคู่ (bg/fg) ที่ผ่าน AA: `[#E0E7FF/#3730A3]`, `[#DCFCE7/#166534]`, `[#FEF3C7/#92400E]`, `[#E0F2FE/#075985]`, `[#FCE7F3/#9D174D]`, `[#EDE9FE/#5B21B6]`; `aria-hidden` (ชื่อจริงอยู่ข้างๆ เสมอ)
**ConfirmDangerZone** `title, description, children(form)` — Card `border-overdue-line` หัวมี `AlertTriangle` ไอคอน overdue-fg, description ระบุผลที่ย้อนไม่ได้, ปุ่มลบ danger ชิดซ้าย; ฟอร์มลบเดิม (DeleteGroupForm/DeleteTaskForm/LeaveGroup) คงขั้นตอนยืนยันเดิม ใส่ในนี้; section ลบอยู่ล่างสุดของหน้าเสมอ แยกด้วย `border-t border-line pt-8`

## 5. สเปกรายหน้า

**Auth (login/signup, `(auth)/layout.tsx`)**: พื้น `page-wash` เต็มจอ, การ์ดกลาง `max-w-md rounded-panel p-8 shadow-pop`. ลำดับ: โลโก้ (สี่เหลี่ยม `size-12`) กึ่งกลาง -> ชื่อแอป -> ข้อความคุณค่า "นัดเวลา แบ่งงาน ติดตามความคืบหน้า ของกลุ่มคุณในที่เดียว" (caption ink-muted) -> หัวฟอร์ม (display ขนาด `text-xl`) -> ปุ่ม Google (secondary เต็มกว้าง ไอคอนตัว G เดิม) -> เส้นคั่น "หรือ" -> ฟอร์ม Field (อีเมล, รหัสผ่าน) -> Alert error -> ปุ่ม primary lg เต็มกว้าง -> ลิงก์สลับ login/signup (`text-primary-600 font-medium`). โฟกัสแรก = ช่องอีเมล (`autoFocus` เฉพาะเดสก์ท็อปไม่ต้องบังคับ)
**หน้าแรก `/`**: AppHeader -> PageHeader "สวัสดี {ชื่อ}" + description "เลือกกลุ่มเพื่อทำงานต่อ" ; Alert warning ถ้าโหลดโปรไฟล์ไม่ได้ -> section "กลุ่มของฉัน": grid `sm:grid-cols-2 lg:grid-cols-3` ของ Card interactive (Avatar-like กล่องไอคอน `Users` `size-10 rounded-lg bg-primary-50 text-primary-600`, ชื่อกลุ่ม heading, Badge บทบาท, "N สมาชิก" caption, `ChevronRight` โผล่ขวา) ; ว่าง = EmptyState (`Users`, "ยังไม่มีกลุ่ม", "สร้างกลุ่มแรก หรือเข้ากลุ่มด้วยโค้ดเชิญจากเพื่อน") -> 2 การ์ด "สร้างกลุ่มใหม่" (ไอคอน `Plus`) / "เข้ากลุ่มด้วยโค้ดเชิญ" (ไอคอน `KeyRound`) grid md:2 คอลัมน์ ส่วนนี้ขึ้นก่อนรายการกลุ่มเมื่อไม่มีกลุ่ม. โฟกัส: การ์ดกลุ่ม/ปุ่มสร้าง
**ภาพรวมกลุ่ม**: GroupHeader + GroupNav -> คำอธิบายกลุ่ม (ถ้ามี) ใน Card `bg-surface` -> Dashboard -> สมาชิก (Card list: Avatar md + ชื่อ + "(คุณ)" + Badge บทบาท ชิดขวา) -> ออกจากกลุ่ม (blocked = Alert warning; ปกติ = ConfirmDangerZone) -> ลบกลุ่ม (ConfirmDangerZone) ท้ายสุด
**Dashboard "ใครค้างอะไร"**: heading "สรุปงาน" + caption เดิม -> Alert warning ถ้า truncated -> grid `grid-cols-2 lg:grid-cols-4 gap-3` StatCard 4 ใบ: todo (`Circle`), doing (`Loader`), done (`CheckCircle2`), overdue (`AlertTriangle`) -> heading "ใครค้างอะไร" -> md+: Table คอลัมน์ [สมาชิก (Avatar sm + ชื่อ ลิงก์ไป tasks?assignee= + "(คุณ)")] [ยังไม่เริ่ม] [กำลังทำ] [เสร็จแล้ว] [เลยกำหนด] [ความคืบหน้า]; ความคืบหน้า = แถบ `h-2 w-full max-w-40 rounded-full bg-line overflow-hidden` ภายในแบ่งสัดส่วน flex: done `bg-success-solid`, doing `bg-doing-fg`, todo `bg-line-strong` (กว้างเป็น % ของงานทั้งหมดคนนั้น) + ข้อความ `{done}/{รวม}` tabular-nums ข้างแถบ (+ `role="img"` `aria-label="เสร็จ X จาก Y งาน"`); เลข overdue > 0 = Badge overdue (ไอคอน+เลข), =0 แสดง "-" สี ink-subtle ; แถวของ "คุณ" พื้น `bg-primary-50/50`; ว่าง = EmptyState (`ListChecks`, "ยังไม่มีงานที่มอบหมาย", ปุ่ม "สร้างงานใหม่" ถ้ามีสิทธิ์) ; มือถือ: list card ต่อคน (Avatar + ชื่อ, แถบสัดส่วนเต็มกว้าง, `<dl>` 4 ค่า grid-cols-2)
**สมาชิก (members)**: PageHeader "จัดการสมาชิก" -> Card list สมาชิก (Avatar, ชื่อ, Badge บทบาท; MemberActions ชิดขวา เป็น Button sm secondary/danger; มือถือ actions ขึ้นบรรทัดใหม่เต็มกว้าง) -> "ลิงก์เชิญ": Card ฟอร์ม InviteForm -> รายการลิงก์ (InviteItem: ลิงก์ใน `font-mono text-xs bg-surface-muted rounded-control px-2 py-1 break-all`, ปุ่ม `Copy` sm ghost, Badge สถานะ active=done "ใช้ได้" / ไม่ active=neutral ตามข้อความเดิม); ว่าง = EmptyState (`Link2`, "ยังไม่มีลิงก์เชิญ", "สร้างลิงก์เพื่อชวนเพื่อนเข้ากลุ่ม")
**join `/join/[code]`**: เลย์เอาต์เดียวกับ auth (การ์ดกลาง `max-w-md`): ไอคอน `UserPlus` ใน circle primary-50 -> "คุณได้รับเชิญเข้ากลุ่ม" -> คำอธิบาย -> ปุ่ม primary lg เต็มกว้าง; ลิงก์ผิด = ErrorPanel-style (circle แดง `LinkIcon`/`AlertTriangle`) + ปุ่มกลับหน้าแรก
**รายการงาน**: PageHeader "งาน" (+ จำนวน `Badge neutral`) actions = Button primary `Plus` "สร้างงานใหม่" (ถ้ามีสิทธิ์) -> แถบตัวกรอง Card `p-4` `grid sm:grid-cols-4 items-end gap-3` (3 Select + ปุ่ม "กรอง" secondary + "ล้างตัวกรอง" ghost เมื่อ filtered; ยังเป็น `<form method=get>` เดิม) -> Alert warning (ข้อความเดิม) -> md+: Table [งาน (ลิงก์ title `font-medium text-ink hover:text-primary-700`)] [ผู้รับผิดชอบ (Avatar ซ้อน `-space-x-2` สูงสุด 3 + ชื่อ/"+N"; ต้องมีรายชื่อใน `sr-only`)] [สถานะต่อคน -> Badge รวม] [กำหนดส่ง + DeadlineBadge]; มือถือ list card: title, DeadlineBadge, กำหนดส่ง (`CalendarClock` ไอคอน), รายชื่อ + StatusBadge ; ห้ามเปลี่ยนข้อมูลที่แสดง (ยังต้องเห็นสถานะรายคนเหมือนเดิม: แสดงเป็น "ชื่อ + StatusBadge" ต่อบรรทัดในคอลัมน์ผู้รับผิดชอบเลยก็ได้ ไม่ต้องใช้ Avatar ซ้อน ถ้าซับซ้อน) ; ว่าง = EmptyState (filtered: `SearchX` "ไม่พบงานที่ตรงกับตัวกรอง" + ปุ่ม ล้างตัวกรอง ; ไม่ filtered: `ListChecks` "ยังไม่มีงานในกลุ่มนี้" + ปุ่มสร้างงาน) -> pagination: ปุ่ม secondary sm `ChevronLeft`/`ChevronRight` + "หน้า X จาก Y" กึ่งกลาง
**สร้างงาน / ดูงาน / แก้งาน**: ดูงาน = PageHeader (backHref รายการงาน, title งาน, actions ว่าง) + แถว meta (`CalendarClock` กำหนดส่ง, DeadlineBadge) + คำอธิบาย Card -> Card "ผู้รับผิดชอบ (N)" รายการ (Avatar + ชื่อ + StatusBadge + ปุ่มเอาออก ghost danger-text เฉพาะ admin) + AddAssigneeForm -> "สถานะงานของคุณ" Card (MyStatusForm เป็น SegmentedFilter แบบปุ่ม 3 ตัว todo/doing/done ตัวที่เลือกมี `aria-pressed` + ไอคอน) -> แก้งาน Card (Field) -> ลบงาน ConfirmDangerZone. สร้างงาน = PageHeader + Card ฟอร์ม `max-w-2xl`, ปุ่มส่งท้ายฟอร์ม primary + ยกเลิก ghost
**ปฏิทิน**: PageHeader "ปฏิทิน" -> section "นัดหมายที่จะมาถึง": Card list (กล่องวันที่ซ้าย `size-12 rounded-lg bg-primary-50 text-primary-700` แสดงวันที่ตัวเลขใหญ่ + เดือนย่อ, ขวา title heading + `Clock` เวลา + คำอธิบาย; DeleteEventForm ชิดขวา ghost danger) ; ว่าง EmptyState (`CalendarPlus`) -> section "ปฏิทินกลาง": แถบสรุป (`Users` "กรอกแล้ว X จาก Y คน" + แถบ progress) + toggle ช่วงเวลา เป็น SegmentedFilter 2 ตัว ("06:00-24:00" / "ทั้งวัน") แทนปุ่มลิงก์เดิม (href เดิม `?view=all`) -> Alert warning ถ้า truncated -> ถ้า respondedCount=0 EmptyState (`Clock`, "ยังไม่มีใครกรอกเวลาว่าง", ปุ่ม primary "กรอกเวลาว่างของฉัน")
**Heatmap**: Card `p-0 overflow-hidden`; scroll container `max-h-[70vh] overflow-auto` ; sticky header แถววัน `sticky top-0 z-20 bg-surface-muted` + คอลัมน์เวลา `sticky left-0 z-10` (มุมซ้ายบน z-30) ; ช่อง `h-9 md:h-8 w-full text-xs tabular-nums transition-colors` ; เส้นกริดระหว่างช่อง `border-b border-white` (เว้นร่องขาวบางๆ ให้ดูเป็นโมเสก) ; พาเลตต์ single-hue (แทน `HEAT_LEVEL_CLASSES` ใน `lib/availability/display.ts` เป็นชื่อ token): 
| ระดับ | พื้น | ตัวเลข | contrast |
|---|---|---|---|
| 0 ไม่มีใครว่าง | #FFFFFF | #64748B | 4.76 |
| 1 <=25% | primary-100 #E0E7FF | primary-900 #312E81 | 9.27 |
| 2 <=50% | primary-300 #A5B4FC | #1E1B4B | 8.02 |
| 3 <=75% | primary-600 #4F46E5 | #FFFFFF | 6.29 |
| 4 >75% | primary-900 #312E81 | #FFFFFF | 11.42 |
ช่องที่ว่างครบทุกคน = `font-bold` + ไอคอน `Check` 10px หน้าเลข (ไม่พึ่งสีอย่างเดียว) ; hover ช่อง `hover:brightness-95` ; selected = `outline-2 -outline-offset-2 outline-ink` + `ring` ขาวด้านใน ; Legend: แถวเดียว 5 สี่เหลี่ยม `size-5 rounded` + ป้ายเดิม (`text-xs text-ink-muted`) เรียงจากน้อยไปมาก พร้อมคำอธิบายตัวเลขเดิม; แผงรายละเอียดช่อง: Card `border-primary-200` หัว (วัน+เวลา heading, ปุ่ม ghost `X` "ปิด") -> 2 คอลัมน์ "ว่าง (N)" (ไอคอน `CheckCircle2` สี done-fg + รายการ Avatar sm + ชื่อ) / "ไม่ว่าง (N)" (`MinusCircle` ink-subtle) -> CreateEventForm ใน `border-t border-line pt-4` ; ยังไม่เลือกช่อง = ข้อความชวนกด (`MousePointerClick` ไอคอน caption)
**กรอกเวลาว่าง (กริด)**: PageHeader "เวลาว่างของฉัน" + description "ลากหรือกดช่องที่คุณว่าง ซ้ำทุกสัปดาห์" -> Card `p-0` กริดโครงเดียวกับ heatmap: ช่องไม่เลือก `bg-surface text-transparent hover:bg-primary-50` + (hover แสดง `Plus` จางไม่ต้อง); ช่องเลือก `bg-primary-600 text-white font-medium` แสดงไอคอน `Check` 12px + (ข้อความ "ว่าง" เดิมคงไว้ใน sr-only) ; ร่องขาว `border-b border-white`; ปุ่ม "ทั้งวัน"/"ล้าง" ในหัวคอลัมน์เป็น text button `text-[11px] font-medium text-primary-700 hover:underline` ความสูง tap >= 28px (ใช้ `py-1`) -> สรุป "เลือกแล้ว N ช่อง (X ชั่วโมงต่อสัปดาห์)" + Badge warning "มีการเปลี่ยนแปลงที่ยังไม่บันทึก" เมื่อ dirty -> Alert success/error -> แถบ save sticky: บนมือถือ `bottom-[calc(3.5rem+env(safe-area-inset-bottom))]` พื้น `bg-surface/95 border-t`, เดสก์ท็อป static
**error / not-found / loading**: ทุก segment (`app`, `groups`, `groups/[groupId]/*`, `join/[code]`, `tasks/[taskId]/not-found`, `groups/not-found`, `global-error.tsx`) ใช้ ErrorPanel/EmptyState/PageSkeleton ชุดเดียว; not-found = EmptyState ไอคอน `SearchX` "ไม่พบหน้าที่ค้นหา" + ปุ่มกลับ; `global-error.tsx` ไม่มี provider จึงต้องใช้ class ล้วนและโหลดฟอนต์ไม่ได้ ให้ยอม fallback system-ui. loading แต่ละ segment ใช้โครง skeleton ตรงกับหน้าจริง (ตัวอย่าง: ภาพรวมมี StatCard 4 ใบ, งานมี list 5 แถว, ปฏิทิน/เวลาว่างมีกล่องกริดสูง 24rem)

## 6. Accessibility
- focus ring ตาม 2.6 ทุกตัว; ห้าม `outline-none` โดยไม่มี outline ทดแทน
- พื้นที่แตะ >= 44x44px บนมือถือ: ปุ่ม/ลิงก์ใน bottom nav (min-h-14), Button md บนมือถือ `min-h-11`, Field `h-11`, แถว Checkbox `min-h-11`; ข้อยกเว้นเดียวคือช่องกริด (h-9, เป้าหมายคือพื้นที่หนาแน่น) และต้องใช้งานด้วยคีย์บอร์ดได้
- สถานะไม่พึ่งสีอย่างเดียว: Badge มีข้อความ+ไอคอน, nav active มีเส้น/แถบ + `aria-current`, heatmap มีตัวเลข, error field มีไอคอน+ข้อความ, ช่องว่างครบมี Check
- aria ที่ต้องมี: `nav aria-label="เมนูกลุ่ม"`; `aria-current="page"` ที่ nav/tab active; `<caption class="sr-only">` ทุกตาราง; `aria-pressed` ปุ่มกริด/สถานะ/segmented; `aria-invalid` + `aria-describedby` ใน Field; `role="alert"` error / `role="status"` success; ไอคอนตกแต่ง `aria-hidden="true"`, ปุ่มที่มีแต่ไอคอนต้องมี `aria-label`; `<details>` switcher/menu ต้อง `<summary>` มี `aria-label`; skip link "ข้ามไปยังเนื้อหา" เป็น element แรกใน AppHeader (`sr-only focus:not-sr-only`) ชี้ `<main id="main">`
- `prefers-reduced-motion`: ปิด animate-pulse/transition/scale (motion-reduce:*)
- `lang="th"` คงเดิม; ไม่ใช้ `user-scalable=no`

## 7. ลำดับลงมือทำ (4 รอบ) และรายการตรวจรับ
ทุกรอบ: `npm run lint`, `npx tsc --noEmit`, `npx vitest run` ผ่าน (222 test เดิมต้องไม่พัง; การเปลี่ยน `HEAT_LEVEL_CLASSES` ต้องอัปเดตเทสต์ที่เกี่ยวข้องถ้ามี), ไม่แก้ server action/DAL/สัญญาข้อมูล, ไม่เหลือ class `zinc-*`/`emerald-*`/`red-*`/`amber-*`/`blue-*`/`green-*` ในไฟล์ที่ย้ายแล้ว (grep ตรวจ)

**รอบ 1: tokens + ฟอนต์ + คอมโพเนนต์กลาง + app shell + auth + หน้าแรก**
- ทำ: globals.css (2.2/2.6), layout.tsx (ฟอนต์), `components/ui/*`, `components/shell/*`, `groups/layout.tsx`, `(auth)` ทั้งหมด, `page.tsx` + create/join-group-form, task-badges
- ตรวจรับ: ฟอนต์ไทยโหลด (สระไม่ถูกตัดที่ชื่อยาว "ผู้รับผิดชอบ ที่ ปู่ ฝั่ง"), contrast ตามตาราง 2.3, ปุ่มทุกแบบมีครบ 5 สถานะ, Tab ผ่าน skip link -> header -> เนื้อหา ได้, login/signup/หน้าแรกดูได้ที่ 375px และ 1280px, ไม่มี dark mode หลุด
**รอบ 2: ภาพรวมกลุ่ม / dashboard / สมาชิก / join**
- ทำ: GroupHeader+GroupNav (`groups/[groupId]/layout.tsx`), page.tsx, dashboard.tsx, leave/delete-group-form, members/*, join/*
- ตรวจรับ: bottom nav ไม่บังเนื้อหาท้ายหน้า (เลื่อนสุดแล้วเห็นปุ่มลบกลุ่มครบ), active เมนูถูกต้องทุก route (รวม tasks/[taskId]), เมนู "จัดการสมาชิก"/"เวลาว่าง" ซ่อนตามสิทธิ์, แถบสัดส่วนถูกต้องกับตัวเลข (รวม done+doing+todo), ตารางมี caption และสลับเป็น list card < md, ConfirmDangerZone ยังต้องยืนยันก่อนลบ
**รอบ 3: งานทั้งหมด**
- ทำ: tasks/page.tsx (ตัวกรอง+ตาราง/การ์ด+pagination), new/create-task-form, [taskId]/page.tsx + forms ทั้งหมด, not-found, tasks/loading+error
- ตรวจรับ: ตัวกรอง GET ทำงานและค่าที่เลือกค้างเหมือนเดิม, ทุก empty state (กรอง/ไม่กรอง), เลยกำหนด/ครบกำหนดวันนี้เห็นทั้งสี ข้อความ ไอคอน, ฟอร์มมี error ผูก aria-describedby, pending ปุ่มไม่ขยับ
**รอบ 4: ปฏิทิน / เวลาว่าง / error-loading-not-found ทุก segment**
- ทำ: calendar/* , availability/*, `lib/availability/display.ts` (พาเลตต์), ทุก `error.tsx` `loading.tsx` `not-found.tsx` `global-error.tsx`
- ตรวจรับ: ตัวเลขในช่อง heatmap อ่านออกทั้ง 5 ระดับ, sticky header/คอลัมน์เวลาไม่ทับกันตอนเลื่อน, ลากเลือกช่องด้วยเมาส์และกด Space/Enter ด้วยคีย์บอร์ดยังทำงาน, แถบ save ไม่ถูก bottom nav บัง, ตรวจ 5 state matrix ของทุก fetch (loading/error/empty/timeout/no permission) ให้ไม่ซ้ำหน้าตากัน, ให้ hawk ถ่าย screenshot ทุกหน้าที่ 375px และ 1280px ลง `work-memory/e2e/redesign/` ให้ Panda ตรวจซ้ำ

## 8. ข้อสังเกตสำหรับ wolf
- ห้ามเพิ่ม dependency (ไม่ใช้ clsx/cva): ทำ helper `cn()` ง่ายๆ เองใน `lib/cn.ts` ถ้าต้องการ
- ตรวจ Next 16: อ่าน `node_modules/next/dist/docs/` ก่อนใช้ API ของ next/font และ usePathname ถ้าไม่แน่ใจ
- ถ้าจุดไหนในสเปกชนกับข้อมูลที่มีจริง (เช่น ไม่มี field ที่ต้องแสดง) ให้ตัดองค์ประกอบนั้นออก อย่าเพิ่ม query ใหม่ และแจ้ง Panda

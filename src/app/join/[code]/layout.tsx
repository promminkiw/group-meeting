import { AppHeader } from "@/components/shell/app-header";

// layout ครอบ loading/error ด้วย ผู้ที่ยังไม่เข้ากลุ่มจึงเห็น header เหมือนกัน (switcher ซ่อนเองเมื่อไม่ได้อยู่ใน /groups)
export default function JoinLayout({ children }: LayoutProps<"/join/[code]">) {
  return (
    <>
      <AppHeader />
      <main id="main" className="page-wash min-h-[calc(100dvh-3.5rem)]">
        {children}
      </main>
    </>
  );
}

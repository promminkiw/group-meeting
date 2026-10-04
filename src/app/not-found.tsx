import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <main id="main" className="page-wash flex flex-1 items-center justify-center px-4 py-16">
      <EmptyState
        icon={SearchX}
        title="ไม่พบหน้าที่ค้นหา"
        description="ลิงก์อาจไม่ถูกต้อง หรือหน้านี้ถูกลบไปแล้ว"
        action={<Button href="/">กลับหน้าแรก</Button>}
        className="w-full max-w-md"
      />
    </main>
  );
}

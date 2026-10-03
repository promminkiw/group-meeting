import { Skeleton } from "@/components/ui/skeleton";

// โครงตรงกับหน้าเวลาว่าง: หัวข้อ, กล่องแจ้งเตือน, กริดสูง 24rem, แถบบันทึก
export default function Loading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="กำลังโหลด">
      <div className="space-y-2 pb-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-16 rounded-card" />
      <Skeleton className="h-96 rounded-card" />
      <Skeleton className="h-10 w-28" />
    </div>
  );
}

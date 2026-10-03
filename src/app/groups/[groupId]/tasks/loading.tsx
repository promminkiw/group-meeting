import { Skeleton } from "@/components/ui/skeleton";

// โครงตรงกับหน้ารายการงาน: หัวข้อ + ปุ่ม, แถบตัวกรอง, แถวงาน 5 แถว
export default function Loading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="กำลังโหลด">
      <div className="flex items-start justify-between gap-4 pb-1">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-24 rounded-card sm:h-[88px]" />
      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((index) => (
          <Skeleton key={index} className="h-20 rounded-card" />
        ))}
      </div>
    </div>
  );
}

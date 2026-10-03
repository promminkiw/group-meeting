import { Skeleton } from "@/components/ui/skeleton";

// โครงตรงกับหน้าปฏิทิน: หัวข้อ, นัดหมาย 2 ใบ, ตัวกรองช่วงเวลา, กริดสูง 24rem
export default function Loading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="กำลังโหลด">
      <div className="space-y-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-7 w-48" />
        {[0, 1].map((index) => (
          <Skeleton key={index} className="h-20 rounded-card" />
        ))}
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-11 w-48" />
        </div>
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-96 rounded-card" />
      </div>
    </div>
  );
}

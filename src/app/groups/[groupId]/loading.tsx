import { Skeleton } from "@/components/ui/skeleton";

// โครงตรงกับหน้าภาพรวม: หัวข้อ, StatCard 4 ใบ, ตาราง/การ์ด
export default function Loading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="กำลังโหลด">
      <Skeleton className="h-7 w-32" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-24 rounded-card" />
        ))}
      </div>
      <Skeleton className="h-6 w-40" />
      <div className="space-y-3">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-16 rounded-card" />
        ))}
      </div>
    </div>
  );
}

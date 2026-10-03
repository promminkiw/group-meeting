import { Skeleton } from "@/components/ui/skeleton";

// อยู่ใน groups/layout ที่มี container อยู่แล้ว จึงไม่ใส่ padding ซ้ำ
export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="กำลังโหลด">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-11 w-full" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-24 rounded-card" />
        ))}
      </div>
      <div className="space-y-3">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-16 rounded-card" />
        ))}
      </div>
    </div>
  );
}

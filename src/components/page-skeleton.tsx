import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
  return (
    // ไม่ห่อ max-w/padding เอง เพราะ groups/layout.tsx ห่อให้แล้ว
    <div className="space-y-8" aria-busy="true" aria-label="กำลังโหลด">
      <div className="flex items-start justify-between gap-4">
        <div className="w-1/2 space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-24 rounded-card" />
        ))}
      </div>
      <div className="space-y-3">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-24 rounded-card" />
        ))}
      </div>
    </div>
  );
}

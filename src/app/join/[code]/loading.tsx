import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex justify-center px-4 py-10 sm:px-6 sm:py-16" aria-busy="true" aria-label="กำลังโหลด">
      <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-panel border border-line bg-surface p-8 shadow-pop">
        <Skeleton className="size-12 rounded-full" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="mt-3 h-11 w-full" />
      </div>
    </div>
  );
}

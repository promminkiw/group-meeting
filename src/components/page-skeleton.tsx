export function PageSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-3xl animate-pulse space-y-4 px-4 py-8"
      aria-busy="true"
      aria-label="กำลังโหลด"
    >
      <div className="h-7 w-1/2 rounded bg-zinc-200" />
      <div className="h-24 rounded-xl bg-zinc-200" />
      <div className="h-24 rounded-xl bg-zinc-200" />
    </div>
  );
}

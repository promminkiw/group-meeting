import { CalendarCheck } from "lucide-react";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main
      id="main"
      className="page-wash flex min-h-dvh flex-1 items-center justify-center px-4 py-8 sm:px-6"
    >
      <div className="w-full max-w-md rounded-panel border border-line bg-surface p-6 shadow-pop sm:p-8">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-primary-600">
            <CalendarCheck className="size-6 text-white" aria-hidden="true" />
          </span>
          <p className="mt-3 text-lg font-semibold">Group Meeting</p>
          <p className="mt-1 text-xs leading-[1.6] text-ink-muted">
            นัดเวลา แบ่งงาน ติดตามความคืบหน้า ของกลุ่มคุณในที่เดียว
          </p>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}

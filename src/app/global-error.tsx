"use client";

import { useEffect } from "react";
import "./globals.css";

// ไม่มี provider/ฟอนต์ที่โหลดไว้ จึงใช้ class ล้วนและ fallback เป็น system-ui
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="th">
      <body className="flex min-h-full flex-col bg-bg font-[system-ui] text-ink">
        <div role="alert" className="mx-auto w-full max-w-md px-4 py-16">
          <div className="flex flex-col items-center rounded-card border border-dashed border-line-strong bg-surface px-6 py-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-overdue-bg text-overdue-fg">
              <svg
                viewBox="0 0 24 24"
                className="size-[22px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </span>
            <h1 className="mt-4 text-base font-semibold leading-[1.5]">เกิดข้อผิดพลาด</h1>
            <p className="mt-1 max-w-sm text-sm leading-[1.65] text-ink-muted">
              ระบบมีปัญหาในขณะนี้ กรุณาลองใหม่อีกครั้ง
            </p>
            <button
              type="button"
              onClick={() => retry()}
              className="mt-5 inline-flex h-10 items-center justify-center rounded-control bg-primary-600 px-4 text-sm font-medium text-white shadow-card transition-colors duration-150 hover:bg-primary-700 active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none"
            >
              ลองใหม่
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

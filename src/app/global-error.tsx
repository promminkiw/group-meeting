"use client";

import { useEffect } from "react";
import "./globals.css";

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
      <body className="min-h-full flex flex-col">
        <div role="alert" className="mx-auto w-full max-w-md px-4 py-12 text-center">
          <h2 className="text-lg font-semibold">เกิดข้อผิดพลาด</h2>
          <p className="mt-2 text-sm text-zinc-600">
            ระบบมีปัญหาในขณะนี้ กรุณาลองใหม่อีกครั้ง
          </p>
          <button
            type="button"
            onClick={() => retry()}
            className="mt-5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            ลองใหม่
          </button>
        </div>
      </body>
    </html>
  );
}

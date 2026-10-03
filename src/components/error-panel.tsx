"use client";

import Link from "next/link";
import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  retry: () => void;
  backHref?: string;
  backLabel?: string;
};

export function ErrorPanel({ error, retry, backHref = "/", backLabel = "กลับหน้าแรก" }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="mx-auto w-full max-w-md px-4 py-12 text-center">
      <h2 className="text-lg font-semibold">เกิดข้อผิดพลาด</h2>
      <p className="mt-2 text-sm text-zinc-600">ไม่สามารถโหลดข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง</p>
      <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          ลองใหม่
        </button>
        <Link
          href={backHref}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100"
        >
          {backLabel}
        </Link>
      </div>
    </div>
  );
}

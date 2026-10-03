"use client";

import Link from "next/link";
import { useActionState } from "react";
import { PendingButton } from "@/components/pending-button";
import { confirmJoin, type JoinState } from "./actions";

const initialState: JoinState = {};

export function JoinForm({ code }: { code: string }) {
  const [state, formAction] = useActionState(confirmJoin, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="code" value={code} />
      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <PendingButton label="เข้าร่วมกลุ่ม" pendingLabel="กำลังเข้ากลุ่ม..." />
        <Link
          href="/"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-center text-sm font-medium hover:bg-zinc-100"
        >
          ยกเลิก
        </Link>
      </div>
    </form>
  );
}

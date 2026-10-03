"use client";

import { useActionState } from "react";
import { PendingButton } from "@/components/pending-button";
import { createInvite, type MemberActionState } from "./actions";

const initialState: MemberActionState = {};

export function InviteForm({ groupId }: { groupId: string }) {
  const [state, formAction] = useActionState(createInvite, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="groupId" value={groupId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="invite-max-uses" className="block text-sm font-medium text-zinc-700">
            ใช้ได้สูงสุดกี่ครั้ง (เว้นว่าง = ไม่จำกัด)
          </label>
          <input
            id="invite-max-uses"
            name="maxUses"
            type="number"
            min={1}
            max={1000}
            step={1}
            inputMode="numeric"
            defaultValue={state.values?.maxUses}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-base"
          />
        </div>
        <div>
          <label htmlFor="invite-expires" className="block text-sm font-medium text-zinc-700">
            หมดอายุ
          </label>
          <select
            id="invite-expires"
            name="expiresInDays"
            defaultValue={state.values?.expiresInDays ?? "7"}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base"
          >
            <option value="1">ใน 1 วัน</option>
            <option value="7">ใน 7 วัน</option>
            <option value="30">ใน 30 วัน</option>
            <option value="never">ไม่หมดอายุ</option>
          </select>
        </div>
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <PendingButton label="สร้างลิงก์เชิญ" pendingLabel="กำลังสร้าง..." className="w-full sm:w-auto" />
    </form>
  );
}

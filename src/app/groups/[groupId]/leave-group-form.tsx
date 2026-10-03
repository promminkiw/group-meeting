"use client";

import { useActionState } from "react";
import { PendingButton } from "@/components/pending-button";
import { leaveGroup, type LeaveState } from "./actions";

const initialState: LeaveState = {};

export function LeaveGroupForm({ groupId }: { groupId: string }) {
  const [state, formAction] = useActionState(leaveGroup, initialState);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm("ต้องการออกจากกลุ่มนี้ใช่หรือไม่?")) event.preventDefault();
      }}
      className="space-y-2"
    >
      <input type="hidden" name="groupId" value={groupId} />
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <PendingButton label="ออกจากกลุ่ม" pendingLabel="กำลังออก..." variant="danger" />
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { LogOut } from "lucide-react";
import { PendingButton } from "@/components/pending-button";
import { Alert } from "@/components/ui/alert";
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
      className="space-y-3"
    >
      <input type="hidden" name="groupId" value={groupId} />
      <Alert tone="error">{state.error}</Alert>
      <PendingButton label="ออกจากกลุ่ม" pendingLabel="กำลังออก..." variant="danger" icon={LogOut} />
    </form>
  );
}

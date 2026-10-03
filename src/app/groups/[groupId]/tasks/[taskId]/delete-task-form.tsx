"use client";

import { useActionState } from "react";
import { PendingButton } from "@/components/pending-button";
import { deleteTask, type TaskActionState } from "../actions";

const initialState: TaskActionState = {};

export function DeleteTaskForm({ groupId, taskId }: { groupId: string; taskId: string }) {
  const [state, formAction] = useActionState(deleteTask, initialState);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm("ลบงานนี้ถาวรใช่หรือไม่? การลบไม่สามารถย้อนกลับได้")) event.preventDefault();
      }}
      className="space-y-2"
    >
      <input type="hidden" name="groupId" value={groupId} />
      <input type="hidden" name="taskId" value={taskId} />
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <PendingButton label="ลบงานนี้" pendingLabel="กำลังลบ..." variant="danger" />
    </form>
  );
}

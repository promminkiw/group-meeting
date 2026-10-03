"use client";

import { useActionState } from "react";
import { PendingButton } from "@/components/pending-button";
import { TASK_STATUSES } from "@/lib/tasks/filters";
import { TASK_STATUS_LABELS } from "@/lib/tasks/labels";
import type { TaskStatus } from "@/types/database";
import { updateMyTaskStatus, type TaskActionState } from "../actions";

const initialState: TaskActionState = {};

type Props = { groupId: string; taskId: string; currentStatus: TaskStatus };

export function MyStatusForm({ groupId, taskId, currentStatus }: Props) {
  const [state, formAction] = useActionState(updateMyTaskStatus, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="groupId" value={groupId} />
      <input type="hidden" name="taskId" value={taskId} />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1 sm:max-w-xs">
          <label htmlFor="my-status" className="block text-sm font-medium text-zinc-700">
            เปลี่ยนสถานะ
          </label>
          <select
            id="my-status"
            name="status"
            defaultValue={currentStatus}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base"
          >
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {TASK_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
        <PendingButton label="บันทึกสถานะ" pendingLabel="กำลังบันทึก..." />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-green-700">
          บันทึกสถานะแล้ว
        </p>
      )}
    </form>
  );
}

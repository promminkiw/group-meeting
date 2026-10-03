"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Circle, Loader } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/cn";
import { TASK_STATUSES } from "@/lib/tasks/filters";
import { TASK_STATUS_LABELS } from "@/lib/tasks/labels";
import type { TaskStatus } from "@/types/database";
import { updateMyTaskStatus, type TaskActionState } from "../actions";

const initialState: TaskActionState = {};

const STATUS_ICONS = { todo: Circle, doing: Loader, done: CheckCircle2 };

type Props = { groupId: string; taskId: string; currentStatus: TaskStatus };

function StatusOption({ status, pressed }: { status: TaskStatus; pressed: boolean }) {
  const { pending } = useFormStatus();
  const Icon = STATUS_ICONS[status];

  return (
    <button
      type="submit"
      name="status"
      value={status}
      aria-pressed={pressed}
      disabled={pending}
      className={cn(
        "inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-colors motion-reduce:transition-none sm:h-9 sm:flex-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        pressed ? "bg-surface text-ink shadow-card" : "text-ink-muted not-disabled:hover:text-ink",
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      {TASK_STATUS_LABELS[status]}
    </button>
  );
}

export function MyStatusForm({ groupId, taskId, currentStatus }: Props) {
  const [state, formAction] = useActionState(updateMyTaskStatus, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="groupId" value={groupId} />
      <input type="hidden" name="taskId" value={taskId} />
      <div role="group" aria-label="เปลี่ยนสถานะ" className="flex gap-1 rounded-control bg-surface-muted p-1 sm:inline-flex">
        {TASK_STATUSES.map((status) => (
          <StatusOption key={status} status={status} pressed={status === currentStatus} />
        ))}
      </div>
      <Alert tone="error">{state.error}</Alert>
      {state.success && <Alert tone="success">บันทึกสถานะแล้ว</Alert>}
    </form>
  );
}

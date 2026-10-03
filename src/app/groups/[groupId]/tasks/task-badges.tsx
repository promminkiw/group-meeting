import type { DeadlineState } from "@/lib/tasks/deadline";
import { TASK_STATUS_LABELS } from "@/lib/tasks/labels";
import type { TaskStatus } from "@/types/database";

const STATUS_CLASSES: Record<TaskStatus, string> = {
  todo: "bg-zinc-100 text-zinc-700",
  doing: "bg-blue-50 text-blue-800",
  done: "bg-green-50 text-green-800",
};

// สีเป็นเพียงตัวเสริม ความหมายอยู่ที่ข้อความ
export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_CLASSES[status]}`}>
      {TASK_STATUS_LABELS[status]}
    </span>
  );
}

export function DeadlineBadge({ state }: { state: DeadlineState }) {
  if (state === "overdue") {
    return (
      <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
        เลยกำหนด
      </span>
    );
  }
  if (state === "today") {
    return (
      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
        ครบกำหนดวันนี้
      </span>
    );
  }
  return null;
}

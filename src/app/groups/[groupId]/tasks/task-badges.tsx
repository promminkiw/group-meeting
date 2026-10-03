import { AlertTriangle, CheckCircle2, Circle, Clock, Loader } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { IconComponent } from "@/components/ui/icon";
import type { DeadlineState } from "@/lib/tasks/deadline";
import { TASK_STATUS_LABELS } from "@/lib/tasks/labels";
import type { TaskStatus } from "@/types/database";

const STATUS_TONES: Record<TaskStatus, { tone: BadgeTone; icon: IconComponent }> = {
  todo: { tone: "todo", icon: Circle },
  doing: { tone: "doing", icon: Loader },
  done: { tone: "done", icon: CheckCircle2 },
};

// ความหมายอยู่ที่ข้อความและไอคอน สีเป็นเพียงตัวเสริม
export function StatusBadge({ status }: { status: TaskStatus }) {
  const { tone, icon } = STATUS_TONES[status];
  return (
    <Badge tone={tone} icon={icon}>
      {TASK_STATUS_LABELS[status]}
    </Badge>
  );
}

export function DeadlineBadge({ state }: { state: DeadlineState }) {
  if (state === "overdue") {
    return (
      <Badge tone="overdue" icon={AlertTriangle}>
        เลยกำหนด
      </Badge>
    );
  }
  if (state === "today") {
    return (
      <Badge tone="warning" icon={Clock}>
        ครบกำหนดวันนี้
      </Badge>
    );
  }
  return null;
}

import type { TaskStatus } from "@/types/database";
import type { DeadlineFilter } from "./filters";

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "ยังไม่เริ่ม",
  doing: "กำลังทำ",
  done: "เสร็จแล้ว",
};

export const DEADLINE_FILTER_LABELS: Record<DeadlineFilter, string> = {
  overdue: "เลยกำหนด",
  today: "ครบกำหนดวันนี้",
  week: "ภายใน 7 วัน",
  none: "ไม่มีกำหนด",
};

import type { TaskStatus } from "@/types/database";
import { addDays, bangkokDayKey, bangkokDayStart } from "./time";

export type DeadlineState = "overdue" | "today" | "upcoming" | "none" | "completed";

export function classifyDeadline(
  deadline: string | null | undefined,
  status: TaskStatus,
  now: Date,
): DeadlineState {
  if (!deadline) return "none";
  const due = new Date(deadline);
  if (Number.isNaN(due.getTime())) return "none";
  if (status === "done") return "completed";
  if (due.getTime() < now.getTime()) return "overdue";
  return bangkokDayKey(due) === bangkokDayKey(now) ? "today" : "upcoming";
}

// งานเสร็จเมื่อทุกคนเสร็จ; งานที่ไม่มีผู้รับผิดชอบไม่นับว่าเลยกำหนด เพราะไม่มีใครค้าง
export function classifyTaskDeadline(
  deadline: string | null | undefined,
  statuses: readonly TaskStatus[],
  now: Date,
): DeadlineState {
  if (statuses.length === 0) {
    const state = classifyDeadline(deadline, "todo", now);
    return state === "overdue" ? "upcoming" : state;
  }
  const allDone = statuses.every((status) => status === "done");
  return classifyDeadline(deadline, allDone ? "done" : "todo", now);
}

// ขอบเขตเวลา (ISO UTC) สำหรับกรอง deadline ที่ฝั่ง database; ช่วงเป็น [from, to)
export type DeadlineBounds = { from: string; to: string };

export function deadlineFilterBounds(
  filter: "today" | "week",
  now: Date,
): DeadlineBounds {
  const todayStart = bangkokDayStart(now);
  const days = filter === "today" ? 1 : 7;
  return { from: todayStart.toISOString(), to: addDays(todayStart, days).toISOString() };
}

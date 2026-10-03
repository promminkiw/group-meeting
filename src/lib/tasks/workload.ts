import type { TaskStatus } from "@/types/database";
import { classifyDeadline } from "./deadline";

export type AssigneeRow = {
  userId: string;
  status: TaskStatus;
  deadline: string | null;
};

export type MemberRef = { userId: string; displayName: string };

export type MemberWorkload = MemberRef & {
  todo: number;
  doing: number;
  done: number;
  overdue: number;
  open: number;
};

export type TaskSummary = {
  todo: number;
  doing: number;
  done: number;
  overdue: number;
};

export function computeSummary(rows: readonly AssigneeRow[], now: Date): TaskSummary {
  const summary: TaskSummary = { todo: 0, doing: 0, done: 0, overdue: 0 };
  for (const row of rows) {
    summary[row.status] += 1;
    if (classifyDeadline(row.deadline, row.status, now) === "overdue") summary.overdue += 1;
  }
  return summary;
}

// รวมสมาชิกที่ไม่มีงานเลย เรียงคนที่ค้าง (todo+doing) มากสุดก่อน
export function computeWorkload(
  rows: readonly AssigneeRow[],
  members: readonly MemberRef[],
  now: Date,
): MemberWorkload[] {
  const byUser = new Map<string, MemberWorkload>(
    members.map((member) => [
      member.userId,
      { ...member, todo: 0, doing: 0, done: 0, overdue: 0, open: 0 },
    ]),
  );

  for (const row of rows) {
    const entry = byUser.get(row.userId);
    if (!entry) continue;
    entry[row.status] += 1;
    if (row.status !== "done") entry.open += 1;
    if (classifyDeadline(row.deadline, row.status, now) === "overdue") entry.overdue += 1;
  }

  return [...byUser.values()].sort(
    (a, b) =>
      b.open - a.open ||
      b.overdue - a.overdue ||
      a.displayName.localeCompare(b.displayName, "th"),
  );
}

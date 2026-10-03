import { isUuid } from "@/lib/groups/validation";
import type { TaskStatus } from "@/types/database";

export const TASK_STATUSES: readonly TaskStatus[] = ["todo", "doing", "done"];
export const DEADLINE_FILTERS = ["overdue", "today", "week", "none"] as const;
export type DeadlineFilter = (typeof DEADLINE_FILTERS)[number];

export const MAX_PAGE = 100_000;

export type TaskFilters = {
  assignee?: string;
  status?: TaskStatus;
  deadline?: DeadlineFilter;
  page: number;
};

type RawSearchParams = Record<string, string | string[] | undefined>;

function firstValue(raw: RawSearchParams, key: string): string | undefined {
  const value = raw[key];
  return Array.isArray(value) ? value[0] : value;
}

// ค่าที่ไม่ถูกต้องถูกทิ้ง ไม่ throw
export function parseTaskFilters(raw: RawSearchParams): TaskFilters {
  const filters: TaskFilters = { page: 1 };

  const assignee = firstValue(raw, "assignee")?.trim();
  if (assignee === "me") filters.assignee = "me";
  else if (assignee && isUuid(assignee)) filters.assignee = assignee.toLowerCase();

  const status = firstValue(raw, "status");
  if (status && (TASK_STATUSES as readonly string[]).includes(status)) {
    filters.status = status as TaskStatus;
  }

  const deadline = firstValue(raw, "deadline");
  if (deadline && (DEADLINE_FILTERS as readonly string[]).includes(deadline)) {
    filters.deadline = deadline as DeadlineFilter;
  }

  const page = firstValue(raw, "page")?.trim();
  if (page && /^\d+$/.test(page)) {
    const value = Number(page);
    if (value >= 1 && value <= MAX_PAGE) filters.page = value;
  }

  return filters;
}

export function hasActiveFilters(filters: TaskFilters): boolean {
  return Boolean(filters.assignee || filters.status || filters.deadline);
}

// สร้าง query string สำหรับลิงก์ที่คง filter ไว้ (หน้า 1 ไม่ต้องใส่ page)
export function buildTaskQuery(filters: TaskFilters, overrides: Partial<TaskFilters> = {}): string {
  const merged = { ...filters, ...overrides };
  const params = new URLSearchParams();
  if (merged.assignee) params.set("assignee", merged.assignee);
  if (merged.status) params.set("status", merged.status);
  if (merged.deadline) params.set("deadline", merged.deadline);
  if (merged.page > 1) params.set("page", String(merged.page));
  const query = params.toString();
  return query ? `?${query}` : "";
}

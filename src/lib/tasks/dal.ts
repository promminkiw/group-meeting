import { cache } from "react";
import { verifySession } from "@/lib/auth/dal";
import { isUuid } from "@/lib/groups/validation";
import { createClient } from "@/lib/supabase/server";
import type { TaskAssigneeRow, TaskRow, TaskStatus } from "@/types/database";
import { deadlineFilterBounds } from "./deadline";
import type { TaskFilters } from "./filters";
import { paginate, type Pagination } from "./pagination";
import type { AssigneeRow } from "./workload";

export const TASKS_PAGE_SIZE = 20;

// Supabase จำกัด 1000 แถวต่อคำขอ จึงดึงเป็นก้อน; เพดานรวม 10000 แถวต่อกลุ่ม
// เกินนี้ dashboard จะนับไม่ครบ (truncated = true) และต้องแสดงคำเตือนให้ผู้ใช้ทราบ
const ASSIGNEE_CHUNK_SIZE = 1000;
const ASSIGNEE_ROW_CEILING = 10_000;

// PostgREST ตอบ PGRST103 เมื่อ range เริ่มเกินจำนวนแถวที่มี
const RANGE_NOT_SATISFIABLE = "PGRST103";

const TASK_COLUMNS = "id, group_id, title, description, deadline, created_by, created_at, updated_at";

export type TaskAssignment = { userId: string; status: TaskStatus };

export type TaskWithAssignees = TaskRow & { assignees: TaskAssignment[] };

export type TaskListResult = {
  tasks: TaskWithAssignees[];
  total: number;
  pagination: Pagination;
};

type AssignmentQueryRow = Pick<TaskAssigneeRow, "task_id" | "user_id" | "status" | "assigned_at">;

type AssigneeChunkRow = {
  user_id: string;
  status: TaskStatus;
  tasks: { deadline: string | null } | null;
};

function toAssignments(rows: AssignmentQueryRow[], taskId: string): TaskAssignment[] {
  return rows
    .filter((row) => row.task_id === taskId)
    .sort((a, b) => a.assigned_at.localeCompare(b.assigned_at))
    .map((row) => ({ userId: row.user_id, status: row.status }));
}

async function loadAssignments(taskIds: string[]): Promise<AssignmentQueryRow[]> {
  if (taskIds.length === 0) return [];
  const supabase = await createClient();
  const rows: AssignmentQueryRow[] = [];

  // แบ่งก้อนเพราะ Supabase ตัดผลที่ 1000 แถวแบบเงียบๆ
  for (let from = 0; ; from += ASSIGNEE_CHUNK_SIZE) {
    const { data, error } = await supabase
      .from("task_assignees")
      .select("task_id, user_id, status, assigned_at")
      .in("task_id", taskIds)
      .order("task_id", { ascending: true })
      .order("user_id", { ascending: true })
      .range(from, from + ASSIGNEE_CHUNK_SIZE - 1);

    if (error) throw new Error(`Failed to load task assignees: ${error.message}`);

    const chunk = (data ?? []) as unknown as AssignmentQueryRow[];
    rows.push(...chunk);
    if (chunk.length < ASSIGNEE_CHUNK_SIZE) return rows;
  }
}

// เมื่อกรองตามคน/สถานะ/เลยกำหนด ต้อง inner join เพื่อให้นับและแบ่งหน้าบนชุดที่กรองแล้ว
function needsAssigneeJoin(filters: TaskFilters): boolean {
  return Boolean(filters.assignee || filters.status || filters.deadline === "overdue");
}

export const getTaskList = cache(
  async (groupId: string, filters: TaskFilters): Promise<TaskListResult> => {
    const empty = (): TaskListResult => ({
      tasks: [],
      total: 0,
      pagination: paginate(0, 1, TASKS_PAGE_SIZE),
    });
    if (!isUuid(groupId)) return empty();

    const user = await verifySession();
    const supabase = await createClient();
    const now = new Date();
    const assigneeId = filters.assignee === "me" ? user.id : filters.assignee;
    const joinAssignees = needsAssigneeJoin(filters);

    const runPage = (page: number) => {
      const offset = (page - 1) * TASKS_PAGE_SIZE;
      const select = joinAssignees
        ? `${TASK_COLUMNS}, task_assignees!inner(user_id)`
        : TASK_COLUMNS;
      let query = supabase.from("tasks").select(select, { count: "exact" }).eq("group_id", groupId);

      if (assigneeId) query = query.eq("task_assignees.user_id", assigneeId);
      if (filters.status) query = query.eq("task_assignees.status", filters.status);

      switch (filters.deadline) {
        case "overdue":
          // เลยกำหนดและยังมีคนที่ไม่เสร็จ (ถ้ากรองคนด้วย = คนนั้นยังไม่เสร็จ)
          query = query.lt("deadline", now.toISOString()).neq("task_assignees.status", "done");
          break;
        case "today":
        case "week": {
          const bounds = deadlineFilterBounds(filters.deadline, now);
          query = query.gte("deadline", bounds.from).lt("deadline", bounds.to);
          break;
        }
        case "none":
          query = query.is("deadline", null);
          break;
      }

      return query
        .order("deadline", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false })
        .order("id", { ascending: true })
        .range(offset, offset + TASKS_PAGE_SIZE - 1);
    };

    let result = await runPage(filters.page);
    // หน้าที่ขอเกินจำนวนจริง: ถอยไปหน้า 1 เพื่อรู้ยอดรวม แล้วไปหน้าสุดท้าย
    if (result.error?.code === RANGE_NOT_SATISFIABLE) {
      result = await runPage(1);
      const total = result.count ?? 0;
      const lastPage = paginate(total, total, TASKS_PAGE_SIZE).totalPages;
      if (!result.error && lastPage > 1) result = await runPage(lastPage);
    }
    if (result.error) throw new Error(`Failed to load tasks: ${result.error.message}`);

    const total = result.count ?? 0;
    const pagination = paginate(total, filters.page, TASKS_PAGE_SIZE);
    const rows = (result.data ?? []) as unknown as TaskRow[];
    // เลือกคอลัมน์ของ task เท่านั้น ตัดผลจาก inner join ที่ใช้กรองทิ้ง
    const tasks = rows.map(
      ({ id, group_id, title, description, deadline, created_by, created_at, updated_at }): TaskRow => ({
        id,
        group_id,
        title,
        description,
        deadline,
        created_by,
        created_at,
        updated_at,
      }),
    );

    // ดึงผู้รับผิดชอบทั้งหมดแยกอีกครั้ง เพราะ inner join จะคืนเฉพาะแถวที่ตรงเงื่อนไขกรอง
    const assignments = await loadAssignments(tasks.map((task) => task.id));
    return {
      tasks: tasks.map((task) => ({ ...task, assignees: toAssignments(assignments, task.id) })),
      total,
      pagination,
    };
  },
);

export const getTask = cache(
  async (groupId: string, taskId: string): Promise<TaskWithAssignees | null> => {
    if (!isUuid(groupId) || !isUuid(taskId)) return null;

    await verifySession();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tasks")
      .select(TASK_COLUMNS)
      .eq("id", taskId)
      .eq("group_id", groupId)
      .maybeSingle();

    if (error) throw new Error(`Failed to load task: ${error.message}`);
    if (!data) return null;

    const task = data as unknown as TaskRow;
    const assignments = await loadAssignments([task.id]);
    return { ...task, assignees: toAssignments(assignments, task.id) };
  },
);

export type GroupAssigneeRows = { rows: AssigneeRow[]; truncated: boolean };

export const getGroupAssigneeRows = cache(async (groupId: string): Promise<GroupAssigneeRows> => {
  if (!isUuid(groupId)) return { rows: [], truncated: false };

  await verifySession();
  const supabase = await createClient();
  const rows: AssigneeRow[] = [];

  for (let from = 0; from < ASSIGNEE_ROW_CEILING; from += ASSIGNEE_CHUNK_SIZE) {
    const { data, error } = await supabase
      .from("task_assignees")
      .select("user_id, status, tasks!inner(deadline, group_id)")
      .eq("tasks.group_id", groupId)
      .order("task_id", { ascending: true })
      .order("user_id", { ascending: true })
      .range(from, from + ASSIGNEE_CHUNK_SIZE - 1);

    if (error) throw new Error(`Failed to load assignee rows: ${error.message}`);

    const chunk = (data ?? []) as unknown as AssigneeChunkRow[];
    for (const row of chunk) {
      rows.push({ userId: row.user_id, status: row.status, deadline: row.tasks?.deadline ?? null });
    }
    if (chunk.length < ASSIGNEE_CHUNK_SIZE) return { rows, truncated: false };
  }

  // ครบเพดานพอดี: อาจมีแถวเหลืออีก จึงถือว่าถูกตัด
  return { rows, truncated: true };
});

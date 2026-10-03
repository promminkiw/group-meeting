"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getGroupMembers, loadGroupContext, requireGroupAdmin } from "@/lib/groups/dal";
import { isUuid, readText } from "@/lib/groups/validation";
import { can } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";
import { getTask } from "@/lib/tasks/dal";
import { describeTaskDbError, TASK_GENERIC_ERROR } from "@/lib/tasks/errors";
import { TASK_STATUSES } from "@/lib/tasks/filters";
import { parseAssigneeIds, parseTaskInput } from "@/lib/tasks/validation";
import type { TaskStatus } from "@/types/database";

export type TaskFormValues = {
  title: string;
  description: string;
  deadline: string;
  assigneeIds: string[];
};

export type TaskActionState = {
  error?: string;
  success?: boolean;
  // ส่งค่าที่กรอกกลับ เพราะ React ล้างฟอร์มหลัง action จบ
  values?: TaskFormValues;
  // งานที่สร้างแล้วแต่ขั้นตอนต่อมาล้มเหลว ให้ผู้ใช้ไปแก้ต่อที่งานนี้แทนการกดสร้างซ้ำ
  createdTaskHref?: string;
};

const TASK_NOT_FOUND = "ไม่พบงานนี้";

function revalidateGroup(groupId: string) {
  revalidatePath(`/groups/${groupId}`, "layout");
}

function readTaskFields(formData: FormData) {
  return {
    title: readText(formData, "title"),
    description: readText(formData, "description"),
    deadline: readText(formData, "deadline"),
  };
}

export async function createTask(
  _prev: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const groupId = readText(formData, "groupId");
  const fields = readTaskFields(formData);
  const rawAssignees = formData.getAll("assigneeIds");
  const values: TaskFormValues = {
    ...fields,
    assigneeIds: rawAssignees.filter((value): value is string => typeof value === "string"),
  };
  const fail = (error: string): TaskActionState => ({ error, values });

  if (!isUuid(groupId)) return fail(TASK_GENERIC_ERROR);

  const input = parseTaskInput(fields);
  if (!input.ok) return fail(input.error);
  const assigneeIds = parseAssigneeIds(rawAssignees);
  if (!assigneeIds) return fail("ผู้รับผิดชอบที่เลือกไม่ถูกต้อง");

  const check = await requireGroupAdmin(groupId);
  if (!check.ok) return fail(check.error);

  const members = await getGroupMembers(groupId);
  const memberIds = new Set(members.map((member) => member.userId));
  if (!assigneeIds.every((id) => memberIds.has(id))) {
    return fail("ผู้รับผิดชอบต้องเป็นสมาชิกของกลุ่มนี้");
  }

  const supabase = await createClient();
  const { data: created, error: createError } = await supabase
    .from("tasks")
    .insert({ group_id: groupId, created_by: check.userId, ...input.value })
    .select("id")
    .single();

  if (createError || !created) {
    if (createError) console.error("createTask failed:", createError.code);
    return fail(createError ? describeTaskDbError(createError) : TASK_GENERIC_ERROR);
  }
  const taskId = (created as { id: string }).id;

  if (assigneeIds.length > 0) {
    const { error: assignError } = await supabase
      .from("task_assignees")
      .insert(assigneeIds.map((userId) => ({ task_id: taskId, user_id: userId })));

    if (assignError) {
      console.error("createTask assign failed:", assignError.code);
      // ไม่มี transaction ฝั่ง client จึงลบงานที่เพิ่งสร้างเพื่อไม่ให้เหลืองานที่ไม่มีผู้รับผิดชอบ
      const { data: removed, error: cleanupError } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId)
        .eq("group_id", groupId)
        .select("id");

      if (cleanupError || !removed || removed.length === 0) {
        if (cleanupError) console.error("createTask cleanup failed:", cleanupError.code);
        revalidateGroup(groupId);
        return {
          ...fail("สร้างงานแล้วแต่เพิ่มผู้รับผิดชอบไม่สำเร็จ กรุณาเปิดงานที่สร้างไว้เพื่อเพิ่มผู้รับผิดชอบเอง"),
          createdTaskHref: `/groups/${groupId}/tasks/${taskId}`,
        };
      }
      return fail(describeTaskDbError(assignError));
    }
  }

  revalidateGroup(groupId);
  redirect(`/groups/${groupId}/tasks/${taskId}`);
}

export async function updateTask(
  _prev: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const groupId = readText(formData, "groupId");
  const taskId = readText(formData, "taskId");
  const fields = readTaskFields(formData);
  const values: TaskFormValues = { ...fields, assigneeIds: [] };
  const fail = (error: string): TaskActionState => ({ error, values });

  if (!isUuid(groupId) || !isUuid(taskId)) return fail(TASK_GENERIC_ERROR);

  const input = parseTaskInput(fields);
  if (!input.ok) return fail(input.error);

  const check = await requireGroupAdmin(groupId);
  if (!check.ok) return fail(check.error);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update(input.value)
    .eq("id", taskId)
    .eq("group_id", groupId)
    .select("id");

  if (error) {
    console.error("updateTask failed:", error.code);
    return fail(describeTaskDbError(error));
  }
  if (!data || data.length === 0) return fail(TASK_NOT_FOUND);

  revalidateGroup(groupId);
  return { success: true };
}

export async function deleteTask(
  _prev: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const groupId = readText(formData, "groupId");
  const taskId = readText(formData, "taskId");
  if (!isUuid(groupId) || !isUuid(taskId)) return { error: TASK_GENERIC_ERROR };

  const check = await requireGroupAdmin(groupId);
  if (!check.ok) return { error: check.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("group_id", groupId)
    .select("id");

  if (error) {
    console.error("deleteTask failed:", error.code);
    return { error: describeTaskDbError(error) };
  }
  if (!data || data.length === 0) return { error: TASK_NOT_FOUND };

  revalidateGroup(groupId);
  redirect(`/groups/${groupId}/tasks`);
}

export async function addAssignee(
  _prev: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const groupId = readText(formData, "groupId");
  const taskId = readText(formData, "taskId");
  const userId = readText(formData, "userId");
  if (!isUuid(groupId) || !isUuid(taskId)) return { error: TASK_GENERIC_ERROR };
  if (!isUuid(userId)) return { error: "กรุณาเลือกสมาชิกที่จะมอบหมาย" };

  const check = await requireGroupAdmin(groupId);
  if (!check.ok) return { error: check.error };

  // ยืนยันว่างานอยู่ในกลุ่มนี้จริงก่อนเพิ่มผู้รับผิดชอบ
  if (!(await getTask(groupId, taskId))) return { error: TASK_NOT_FOUND };

  const supabase = await createClient();
  const { error } = await supabase
    .from("task_assignees")
    .insert({ task_id: taskId, user_id: userId.toLowerCase() });

  if (error) {
    console.error("addAssignee failed:", error.code);
    return { error: describeTaskDbError(error) };
  }

  revalidateGroup(groupId);
  return { success: true };
}

export async function removeAssignee(
  _prev: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const groupId = readText(formData, "groupId");
  const taskId = readText(formData, "taskId");
  const userId = readText(formData, "userId");
  if (!isUuid(groupId) || !isUuid(taskId) || !isUuid(userId)) return { error: TASK_GENERIC_ERROR };

  const check = await requireGroupAdmin(groupId);
  if (!check.ok) return { error: check.error };

  if (!(await getTask(groupId, taskId))) return { error: TASK_NOT_FOUND };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("task_assignees")
    .delete()
    .eq("task_id", taskId)
    .eq("user_id", userId)
    .select("user_id");

  if (error) {
    console.error("removeAssignee failed:", error.code);
    return { error: describeTaskDbError(error) };
  }
  if (!data || data.length === 0) return { error: "ไม่พบผู้รับผิดชอบคนนี้ในงาน" };

  revalidateGroup(groupId);
  return { success: true };
}

export async function updateMyTaskStatus(
  _prev: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const groupId = readText(formData, "groupId");
  const taskId = readText(formData, "taskId");
  const status = readText(formData, "status");
  if (!isUuid(groupId) || !isUuid(taskId)) return { error: TASK_GENERIC_ERROR };
  if (!(TASK_STATUSES as readonly string[]).includes(status)) return { error: "สถานะไม่ถูกต้อง" };

  const context = await loadGroupContext(groupId);
  if (!context) return { error: "ไม่พบกลุ่มนี้หรือคุณไม่ได้เป็นสมาชิก" };
  if (!can(context.role, "updateOwnTaskStatus")) return { error: "คุณไม่มีสิทธิ์เปลี่ยนสถานะงาน" };

  if (!(await getTask(groupId, taskId))) return { error: TASK_NOT_FOUND };

  const supabase = await createClient();
  // กรอง user_id เสมอ เพื่อแก้ได้เฉพาะแถวของตัวเอง (RLS เป็นด่านจริงอีกชั้น)
  const { data, error } = await supabase
    .from("task_assignees")
    .update({ status: status as TaskStatus })
    .eq("task_id", taskId)
    .eq("user_id", context.userId)
    .select("task_id");

  if (error) {
    console.error("updateMyTaskStatus failed:", error.code);
    return { error: describeTaskDbError(error) };
  }
  if (!data || data.length === 0) return { error: "คุณไม่ได้เป็นผู้รับผิดชอบงานนี้" };

  revalidateGroup(groupId);
  return { success: true };
}

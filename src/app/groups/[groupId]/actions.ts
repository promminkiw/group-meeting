"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getGroupMembers, loadGroupContext, requireGroupAdmin } from "@/lib/groups/dal";
import { isUuid, readText } from "@/lib/groups/validation";
import { can, isLastAdmin } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";

const GROUP_NOT_FOUND = "ไม่พบกลุ่มนี้หรือคุณไม่ได้เป็นสมาชิก";

export type LeaveState = { error?: string };

export async function leaveGroup(_prev: LeaveState, formData: FormData): Promise<LeaveState> {
  const groupId = readText(formData, "groupId");
  if (!isUuid(groupId)) return { error: "ไม่พบกลุ่มนี้" };

  const context = await loadGroupContext(groupId);
  if (!context) return { error: GROUP_NOT_FOUND };
  const { userId, role } = context;
  if (!can(role, "leaveGroup")) return { error: "คุณไม่มีสิทธิ์ออกจากกลุ่มนี้" };

  const members = await getGroupMembers(groupId);
  if (isLastAdmin(members, userId)) {
    return { error: "คุณเป็นผู้ดูแลคนเดียว ต้องมอบสิทธิ์ผู้ดูแลให้สมาชิกคนอื่นก่อนออกจากกลุ่ม" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memberships")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .select("user_id");

  if (error) {
    if (error.message.includes("at least one admin")) {
      return { error: "กลุ่มต้องมีผู้ดูแลอย่างน้อย 1 คน กรุณามอบสิทธิ์ผู้ดูแลให้คนอื่นก่อน" };
    }
    console.error("leaveGroup failed:", error.code);
    return { error: "ออกจากกลุ่มไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" };
  }
  if (!data || data.length === 0) return { error: "ออกจากกลุ่มไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" };

  revalidatePath("/");
  redirect("/");
}

export type DeleteGroupState = { error?: string };

export async function deleteGroup(
  _prev: DeleteGroupState,
  formData: FormData,
): Promise<DeleteGroupState> {
  const groupId = readText(formData, "groupId");
  const confirmName = readText(formData, "confirmName");
  if (!isUuid(groupId)) return { error: "ไม่พบกลุ่มนี้" };

  const context = await loadGroupContext(groupId);
  if (!context) return { error: GROUP_NOT_FOUND };
  const { role, group } = context;
  if (!can(role, "deleteGroup")) return { error: "เฉพาะผู้ดูแลกลุ่มเท่านั้นที่ลบกลุ่มได้" };

  const check = await requireGroupAdmin(groupId);
  if (!check.ok) return { error: check.error };

  if (confirmName.trim() !== group.name) {
    return { error: "ชื่อกลุ่มที่พิมพ์ไม่ตรงกับชื่อกลุ่ม" };
  }

  const supabase = await createClient();
  // ข้อมูลที่เกี่ยวข้องถูกลบต่อเนื่องด้วย cascade ใน database
  const { data, error } = await supabase.from("groups").delete().eq("id", groupId).select("id");

  if (error) {
    console.error("deleteGroup failed:", error.code);
    return { error: "ลบกลุ่มไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" };
  }
  if (!data || data.length === 0) return { error: "ลบกลุ่มไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" };

  revalidatePath("/");
  redirect("/");
}

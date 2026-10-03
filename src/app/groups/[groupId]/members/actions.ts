"use server";

import { revalidatePath } from "next/cache";
import { requireGroupAdmin } from "@/lib/groups/dal";
import { isUuid, readText } from "@/lib/groups/validation";
import { createClient } from "@/lib/supabase/server";

export type MemberActionState = {
  error?: string;
  success?: boolean;
  // ส่งค่าที่กรอกกลับ เพราะ React ล้างฟอร์มหลัง action จบ
  values?: { maxUses: string; expiresInDays: string };
};

const GENERIC_ERROR = "ทำรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
const LAST_ADMIN_ERROR = "กลุ่มต้องมีผู้ดูแลอย่างน้อย 1 คน กรุณามอบสิทธิ์ผู้ดูแลให้คนอื่นก่อน";
const EXPIRY_DAY_OPTIONS = [1, 7, 30];
const MAX_USES_LIMIT = 1000;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

function revalidateMembers(groupId: string) {
  revalidatePath(`/groups/${groupId}`, "layout");
  // หน้าแรกแสดง role และจำนวนสมาชิกของแต่ละกลุ่ม
  revalidatePath("/");
}

function describeDbError(action: string, error: { code?: string; message: string }): string {
  if (error.message.includes("at least one admin")) return LAST_ADMIN_ERROR;
  console.error(`${action} failed:`, error.code);
  return GENERIC_ERROR;
}

export async function changeMemberRole(
  _prev: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const groupId = readText(formData, "groupId");
  const targetUserId = readText(formData, "userId");
  const role = readText(formData, "role");

  if (!isUuid(groupId) || !isUuid(targetUserId)) return { error: GENERIC_ERROR };
  if (role !== "admin" && role !== "member") return { error: "บทบาทไม่ถูกต้อง" };

  const check = await requireGroupAdmin(groupId);
  if (!check.ok) return { error: check.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memberships")
    .update({ role })
    .eq("group_id", groupId)
    .eq("user_id", targetUserId)
    .select("user_id");

  if (error) return { error: describeDbError("changeMemberRole", error) };
  if (!data || data.length === 0) return { error: "ไม่พบสมาชิกคนนี้ในกลุ่ม" };

  revalidateMembers(groupId);
  return { success: true };
}

export async function removeMember(
  _prev: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const groupId = readText(formData, "groupId");
  const targetUserId = readText(formData, "userId");

  if (!isUuid(groupId) || !isUuid(targetUserId)) return { error: GENERIC_ERROR };

  const check = await requireGroupAdmin(groupId);
  if (!check.ok) return { error: check.error };
  if (check.userId === targetUserId) {
    return { error: "หากต้องการออกจากกลุ่ม ให้ใช้ปุ่มออกจากกลุ่มในหน้าภาพรวม" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memberships")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", targetUserId)
    .select("user_id");

  if (error) return { error: describeDbError("removeMember", error) };
  if (!data || data.length === 0) return { error: "ไม่พบสมาชิกคนนี้ในกลุ่ม" };

  revalidateMembers(groupId);
  return { success: true };
}

export async function createInvite(
  _prev: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const groupId = readText(formData, "groupId");
  const maxUsesInput = readText(formData, "maxUses").trim();
  const expiresInput = readText(formData, "expiresInDays");

  const values = { maxUses: maxUsesInput, expiresInDays: expiresInput };
  const fail = (error: string): MemberActionState => ({ error, values });

  if (!isUuid(groupId)) return fail(GENERIC_ERROR);

  let maxUses: number | null = null;
  if (maxUsesInput !== "") {
    maxUses = Number(maxUsesInput);
    if (!Number.isInteger(maxUses) || maxUses < 1 || maxUses > MAX_USES_LIMIT) {
      return fail(`จำนวนครั้งที่ใช้ได้ต้องเป็นจำนวนเต็ม 1-${MAX_USES_LIMIT}`);
    }
  }

  let expiresAt: string | null = null;
  if (expiresInput !== "never") {
    const days = Number(expiresInput);
    if (!EXPIRY_DAY_OPTIONS.includes(days)) return fail("ระยะเวลาหมดอายุไม่ถูกต้อง");
    expiresAt = new Date(Date.now() + days * DAY_IN_MS).toISOString();
  }

  const check = await requireGroupAdmin(groupId);
  if (!check.ok) return fail(check.error);

  const supabase = await createClient();
  const { error } = await supabase.from("invites").insert({
    group_id: groupId,
    created_by: check.userId,
    max_uses: maxUses,
    expires_at: expiresAt,
  });

  if (error) return fail(describeDbError("createInvite", error));

  revalidateMembers(groupId);
  return { success: true };
}

export async function revokeInvite(
  _prev: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const groupId = readText(formData, "groupId");
  const inviteId = readText(formData, "inviteId");

  if (!isUuid(groupId) || !isUuid(inviteId)) return { error: GENERIC_ERROR };

  const check = await requireGroupAdmin(groupId);
  if (!check.ok) return { error: check.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invites")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", inviteId)
    .eq("group_id", groupId)
    .select("id");

  if (error) return { error: describeDbError("revokeInvite", error) };
  if (!data || data.length === 0) return { error: "ไม่พบลิงก์เชิญนี้" };

  revalidateMembers(groupId);
  return { success: true };
}

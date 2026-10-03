"use server";

import { revalidatePath } from "next/cache";
import { loadGroupContext, requireGroupAdmin } from "@/lib/groups/dal";
import { isUuid, readText } from "@/lib/groups/validation";
import { AVAILABILITY_GENERIC_ERROR, describeEventDbError } from "@/lib/availability/errors";
import { parseEventInput } from "@/lib/availability/events";
import { can } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";

export type EventActionState = {
  error?: string;
  success?: boolean;
};

const EVENT_NOT_FOUND = "ไม่พบนัดหมายนี้";
const ADMIN_ONLY_ERROR = "เฉพาะผู้ดูแลกลุ่มเท่านั้นที่ทำรายการนี้ได้";

// requireGroupAdmin ตรวจสิทธิ์จัดการกลุ่ม แล้วตรวจสิทธิ์สร้างนัดหมายซ้ำให้ตรงกับตาราง permissions
async function requireEventAdmin(groupId: string): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const check = await requireGroupAdmin(groupId);
  if (!check.ok) return check;
  const context = await loadGroupContext(groupId);
  if (!context || !can(context.role, "createEvent")) return { ok: false, error: ADMIN_ONLY_ERROR };
  return { ok: true, userId: check.userId };
}

export async function createEvent(
  _prev: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  const input = parseEventInput({
    groupId: readText(formData, "groupId"),
    title: readText(formData, "title"),
    description: readText(formData, "description"),
    date: readText(formData, "date"),
    dayOfWeek: readText(formData, "dayOfWeek"),
    startSlot: readText(formData, "startSlot"),
    slotCount: readText(formData, "slotCount"),
  });
  if (!input.ok) return { error: input.error };

  const groupId = readText(formData, "groupId");
  const check = await requireEventAdmin(groupId);
  if (!check.ok) return { error: check.error };

  if (new Date(input.value.endsAt).getTime() <= Date.now()) {
    return { error: "ช่วงเวลานัดหมายผ่านไปแล้ว กรุณาเลือกวันที่ในอนาคต" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("events").insert({
    group_id: groupId,
    title: input.value.title,
    description: input.value.description,
    starts_at: input.value.startsAt,
    ends_at: input.value.endsAt,
    created_by: check.userId,
  });

  if (error) {
    console.error("createEvent failed:", error.code);
    return { error: describeEventDbError(error) };
  }

  revalidatePath(`/groups/${groupId}`, "layout");
  return { success: true };
}

export async function deleteEvent(
  _prev: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  const groupId = readText(formData, "groupId");
  const eventId = readText(formData, "eventId");
  if (!isUuid(groupId) || !isUuid(eventId)) return { error: AVAILABILITY_GENERIC_ERROR };

  const check = await requireEventAdmin(groupId);
  if (!check.ok) return { error: check.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("group_id", groupId)
    .select("id");

  if (error) {
    console.error("deleteEvent failed:", error.code);
    return { error: describeEventDbError(error) };
  }
  if (!data || data.length === 0) return { error: EVENT_NOT_FOUND };

  revalidatePath(`/groups/${groupId}`, "layout");
  return { success: true };
}

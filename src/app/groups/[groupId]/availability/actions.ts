"use server";

import { revalidatePath } from "next/cache";
import { loadGroupContext } from "@/lib/groups/dal";
import { isUuid, readText } from "@/lib/groups/validation";
import { getMyAvailability } from "@/lib/availability/dal";
import { AVAILABILITY_GENERIC_ERROR, describeAvailabilityDbError } from "@/lib/availability/errors";
import { diffSlots, parseSlotKey, parseSlotKeys, slotsToKeySet } from "@/lib/availability/slots";
import { can } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";

export type AvailabilityActionState = {
  error?: string;
  success?: boolean;
};

export async function saveAvailability(
  _prev: AvailabilityActionState,
  formData: FormData,
): Promise<AvailabilityActionState> {
  const groupId = readText(formData, "groupId");
  if (!isUuid(groupId)) return { error: AVAILABILITY_GENERIC_ERROR };

  const desired = parseSlotKeys(formData.getAll("slots"));
  if (!desired) return { error: "ข้อมูลช่วงเวลาไม่ถูกต้อง กรุณาโหลดหน้าใหม่แล้วลองอีกครั้ง" };

  const context = await loadGroupContext(groupId);
  if (!context) return { error: "ไม่พบกลุ่มนี้หรือคุณไม่ได้เป็นสมาชิก" };
  if (!can(context.role, "fillAvailability")) return { error: "คุณไม่มีสิทธิ์กรอกเวลาว่าง" };

  // อ่านข้อมูลปัจจุบันฝั่ง server เสมอ ไม่เชื่อ diff จาก client
  const current = slotsToKeySet(await getMyAvailability());
  const { toInsert, toDelete } = diffSlots(current, desired);
  if (toInsert.length === 0 && toDelete.length === 0) return { success: true };

  const supabase = await createClient();

  // เพิ่มก่อนลบ: ถ้าขั้นใดล้มเหลวจะไม่ทำให้เวลาว่างเดิมหายไปทั้งหมด
  if (toInsert.length > 0) {
    const rows = toInsert.flatMap((key) => {
      const slot = parseSlotKey(key);
      return slot ? [{ user_id: context.userId, day_of_week: slot.dayOfWeek, slot_index: slot.slotIndex }] : [];
    });
    // ignoreDuplicates กันกรณีกดบันทึกซ้ำหรือสองแท็บพร้อมกัน
    const { error } = await supabase
      .from("availability_slots")
      .upsert(rows, { onConflict: "user_id,day_of_week,slot_index", ignoreDuplicates: true });
    if (error) {
      console.error("saveAvailability insert failed:", error.code);
      return { error: describeAvailabilityDbError(error) };
    }
  }

  // จัดกลุ่มตามวันเพื่อให้ลบด้วยคำขอเดียวต่อวัน (สูงสุด 7 คำขอ)
  const slotsByDay = new Map<number, number[]>();
  for (const key of toDelete) {
    const slot = parseSlotKey(key);
    if (!slot) continue;
    slotsByDay.set(slot.dayOfWeek, [...(slotsByDay.get(slot.dayOfWeek) ?? []), slot.slotIndex]);
  }
  const deletions = await Promise.all(
    [...slotsByDay].map(([dayOfWeek, slotIndexes]) =>
      supabase
        .from("availability_slots")
        .delete()
        .eq("user_id", context.userId)
        .eq("day_of_week", dayOfWeek)
        .in("slot_index", slotIndexes),
    ),
  );
  const failedDeletion = deletions.find((result) => result.error);
  if (failedDeletion?.error) {
    console.error("saveAvailability delete failed:", failedDeletion.error.code);
    return { error: describeAvailabilityDbError(failedDeletion.error) };
  }

  // ข้อมูลเป็นของผู้ใช้ ใช้ร่วมทุกกลุ่ม จึง revalidate ทั้ง /groups
  revalidatePath("/groups", "layout");
  return { success: true };
}

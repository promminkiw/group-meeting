import { cache } from "react";
import { verifySession } from "@/lib/auth/dal";
import { getGroupMembers } from "@/lib/groups/dal";
import { isUuid } from "@/lib/groups/validation";
import { createClient } from "@/lib/supabase/server";
import type { AvailabilitySlotRow, EventRow, GroupMember } from "@/types/database";
import type { AvailabilitySlot } from "./heatmap";

// Supabase จำกัด 1000 แถวต่อคำขอ จึงดึงเป็นก้อน; เพดานรวม 20000 แถวต่อกลุ่ม (เต็มที่ราว 59 คน x 336 ช่อง)
// เกินนี้ตัดตามลำดับ user_id (บางคนหายทั้งคน) จึงต้องแสดงคำเตือนเมื่อ truncated = true
// รายชื่อสมาชิกส่งผ่าน .in() ใน URL จึงเหมาะกับกลุ่มระดับสิบถึงร้อยคน ไม่ใช่หลักพัน
const SLOT_CHUNK_SIZE = 1000;
const SLOT_ROW_CEILING = 20_000;

const UPCOMING_EVENTS_LIMIT = 20;

export type GroupAvailability = {
  members: GroupMember[];
  slots: AvailabilitySlot[];
  truncated: boolean;
};

const EVENT_COLUMNS = "id, group_id, title, description, starts_at, ends_at, created_by, created_at";

export const getMyAvailability = cache(async (): Promise<AvailabilitySlot[]> => {
  const user = await verifySession();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("availability_slots")
    .select("user_id, day_of_week, slot_index")
    .eq("user_id", user.id);

  if (error) throw new Error(`Failed to load my availability: ${error.message}`);

  const rows = (data ?? []) as unknown as AvailabilitySlotRow[];
  return rows.map((row) => ({ userId: row.user_id, dayOfWeek: row.day_of_week, slotIndex: row.slot_index }));
});

export const getGroupAvailability = cache(async (groupId: string): Promise<GroupAvailability> => {
  if (!isUuid(groupId)) return { members: [], slots: [], truncated: false };

  await verifySession();
  const members = await getGroupMembers(groupId);
  if (members.length === 0) return { members, slots: [], truncated: false };

  // RLS ให้เห็นเวลาว่างของทุกคนที่เคยอยู่กลุ่มเดียวกัน จึงกรองเฉพาะสมาชิกกลุ่มนี้เอง
  const memberIds = members.map((member) => member.userId);
  const supabase = await createClient();
  const slots: AvailabilitySlot[] = [];

  for (let from = 0; from < SLOT_ROW_CEILING; from += SLOT_CHUNK_SIZE) {
    const { data, error } = await supabase
      .from("availability_slots")
      .select("user_id, day_of_week, slot_index")
      .in("user_id", memberIds)
      .order("user_id", { ascending: true })
      .order("day_of_week", { ascending: true })
      .order("slot_index", { ascending: true })
      .range(from, from + SLOT_CHUNK_SIZE - 1);

    if (error) throw new Error(`Failed to load group availability: ${error.message}`);

    const chunk = (data ?? []) as unknown as AvailabilitySlotRow[];
    for (const row of chunk) {
      slots.push({ userId: row.user_id, dayOfWeek: row.day_of_week, slotIndex: row.slot_index });
    }
    if (chunk.length < SLOT_CHUNK_SIZE) return { members, slots, truncated: false };
  }

  // ครบเพดานพอดี: อาจมีแถวเหลืออีก จึงถือว่าถูกตัด
  return { members, slots, truncated: true };
});

export const getUpcomingEvents = cache(async (groupId: string): Promise<EventRow[]> => {
  if (!isUuid(groupId)) return [];

  await verifySession();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_COLUMNS)
    .eq("group_id", groupId)
    // กรองด้วยเวลาจบ เพื่อให้นัดที่กำลังประชุมอยู่ยังแสดงและลบได้
    .gt("ends_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(UPCOMING_EVENTS_LIMIT);

  if (error) throw new Error(`Failed to load events: ${error.message}`);
  return (data ?? []) as unknown as EventRow[];
});

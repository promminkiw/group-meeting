export const DAYS_PER_WEEK = 7;
export const SLOTS_PER_DAY = 48;

export type AvailabilitySlot = {
  userId: string;
  dayOfWeek: number;
  slotIndex: number;
};

export type SlotDetail = {
  available: string[];
  unavailable: string[];
};

function isValidSlot(dayOfWeek: number, slotIndex: number): boolean {
  return (
    Number.isInteger(dayOfWeek) &&
    Number.isInteger(slotIndex) &&
    dayOfWeek >= 0 &&
    dayOfWeek < DAYS_PER_WEEK &&
    slotIndex >= 0 &&
    slotIndex < SLOTS_PER_DAY
  );
}

// กรองให้เหลือเฉพาะสมาชิก, ช่วงที่ถูกต้อง และไม่ซ้ำ (user/day/slot เดียวกันนับครั้งเดียว)
function validUniqueSlots(
  slots: AvailabilitySlot[],
  memberIds: string[],
): AvailabilitySlot[] {
  const members = new Set(memberIds);
  const seen = new Set<string>();
  const result: AvailabilitySlot[] = [];
  for (const slot of slots) {
    if (!members.has(slot.userId)) continue;
    if (!isValidSlot(slot.dayOfWeek, slot.slotIndex)) continue;
    const key = `${slot.userId}:${slot.dayOfWeek}:${slot.slotIndex}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(slot);
  }
  return result;
}

export function computeHeatmap(
  slots: AvailabilitySlot[],
  memberIds: string[],
): number[][] {
  const grid = Array.from({ length: DAYS_PER_WEEK }, () =>
    new Array<number>(SLOTS_PER_DAY).fill(0),
  );
  for (const slot of validUniqueSlots(slots, memberIds)) {
    grid[slot.dayOfWeek][slot.slotIndex] += 1;
  }
  return grid;
}

export function getSlotDetail(
  slots: AvailabilitySlot[],
  memberIds: string[],
  dayOfWeek: number,
  slotIndex: number,
): SlotDetail {
  const availableIds = new Set(
    validUniqueSlots(slots, memberIds)
      .filter((s) => s.dayOfWeek === dayOfWeek && s.slotIndex === slotIndex)
      .map((s) => s.userId),
  );
  const uniqueMembers = [...new Set(memberIds)];
  return {
    available: uniqueMembers.filter((id) => availableIds.has(id)),
    unavailable: uniqueMembers.filter((id) => !availableIds.has(id)),
  };
}

export function slotIndexToTimeLabel(slotIndex: number): string {
  const hours = Math.floor(slotIndex / 2);
  const minutes = slotIndex % 2 === 0 ? "00" : "30";
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

// ระดับสี 0-1 สำหรับ heatmap
export function computeIntensity(count: number, memberCount: number): number {
  if (memberCount <= 0) return 0;
  return Math.min(1, Math.max(0, count / memberCount));
}

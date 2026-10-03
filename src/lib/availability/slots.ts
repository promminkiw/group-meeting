import { DAYS_PER_WEEK, SLOTS_PER_DAY } from "./heatmap";

// ไทยไม่มี DST จึงใช้ offset คงที่ +07:00 ได้ (ตรงกับ lib/tasks/time.ts)
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const SLOT_MS = 30 * 60 * 1000;

export const MAX_SLOTS_PER_USER = DAYS_PER_WEEK * SLOTS_PER_DAY;

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const SLOT_KEY_PATTERN = /^([0-6]):([0-9]|[1-3][0-9]|4[0-7])$/;

export type SlotKeySet = ReadonlySet<string>;

export type SlotDiff = { toInsert: string[]; toDelete: string[] };

export type EventRangeResult = { ok: true; endSlot: number } | { ok: false; error: string };

// Date.getDay() ให้ 0=อาทิตย์ จึงแปลงเป็น 0=จันทร์ ตามเวลาไทย
export function weekdayIndexMondayFirst(date: Date): number {
  const bangkokWeekday = new Date(date.getTime() + BANGKOK_OFFSET_MS).getUTCDay();
  return (bangkokWeekday + 6) % 7;
}

function formatUtcDate(utcMs: number): string {
  return new Date(utcMs).toISOString().slice(0, 10);
}

// แยก yyyy-mm-dd เป็น UTC ms ของ 00:00 วันนั้น; null ถ้ารูปแบบหรือวันที่ไม่จริง
function parseDateString(value: string): number | null {
  const match = DATE_PATTERN.exec(value);
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  const utcMs = Date.UTC(year, month - 1, day);
  const check = new Date(utcMs);
  const isRealDate =
    check.getUTCFullYear() === year && check.getUTCMonth() === month - 1 && check.getUTCDate() === day;
  return isRealDate ? utcMs : null;
}

// วัน (0=จันทร์) ของวันที่ yyyy-mm-dd; null ถ้าวันที่ไม่ถูกต้อง
export function weekdayOfDateString(value: string): number | null {
  const utcMs = parseDateString(value);
  if (utcMs === null) return null;
  return (new Date(utcMs).getUTCDay() + 6) % 7;
}

// วันที่ (ตามเวลาไทย) ถัดไปที่ตรงกับ dayOfWeek รวมวันนี้ถ้าตรง; null ถ้า dayOfWeek ไม่ถูกต้อง
export function nextOccurrenceDate(dayOfWeek: number, from: Date): string | null {
  if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek >= DAYS_PER_WEEK) return null;
  const daysAhead = (dayOfWeek - weekdayIndexMondayFirst(from) + DAYS_PER_WEEK) % DAYS_PER_WEEK;
  return formatUtcDate(from.getTime() + BANGKOK_OFFSET_MS + daysAhead * DAY_MS);
}

// boundaryIndex 0-48: ต้นช่อง = index ของช่องนั้น, ปลายช่อง = index + 1 (48 = 24:00 คือเที่ยงคืนวันถัดไป)
export function slotToIso(dateString: string, boundaryIndex: number): string | null {
  if (!Number.isInteger(boundaryIndex) || boundaryIndex < 0 || boundaryIndex > SLOTS_PER_DAY) {
    return null;
  }
  const dayStartUtcMs = parseDateString(dateString);
  if (dayStartUtcMs === null) return null;
  return new Date(dayStartUtcMs + boundaryIndex * SLOT_MS - BANGKOK_OFFSET_MS).toISOString();
}

export function toSlotKey(dayOfWeek: number, slotIndex: number): string {
  return `${dayOfWeek}:${slotIndex}`;
}

export function parseSlotKey(key: string): { dayOfWeek: number; slotIndex: number } | null {
  const match = SLOT_KEY_PATTERN.exec(key);
  if (!match) return null;
  return { dayOfWeek: Number(match[1]), slotIndex: Number(match[2]) };
}

export function slotsToKeySet(
  slots: readonly { dayOfWeek: number; slotIndex: number }[],
): Set<string> {
  return new Set(slots.map((slot) => toSlotKey(slot.dayOfWeek, slot.slotIndex)));
}

export function keySetToSlots(keys: SlotKeySet): { dayOfWeek: number; slotIndex: number }[] {
  const slots: { dayOfWeek: number; slotIndex: number }[] = [];
  for (const key of keys) {
    const parsed = parseSlotKey(key);
    if (parsed) slots.push(parsed);
  }
  return slots;
}

// ลบเฉพาะที่เอาออก เพิ่มเฉพาะที่เพิ่มใหม่
export function diffSlots(currentSet: SlotKeySet, desiredSet: SlotKeySet): SlotDiff {
  return {
    toInsert: [...desiredSet].filter((key) => !currentSet.has(key)),
    toDelete: [...currentSet].filter((key) => !desiredSet.has(key)),
  };
}

// รับค่าจากฟอร์มที่ไม่น่าเชื่อถือ: คืน Set ที่ไม่ซ้ำ หรือ null ถ้ามีค่าผิดรูปแบบ/เกินจำนวนที่เป็นไปได้
export function parseSlotKeys(values: readonly FormDataEntryValue[]): Set<string> | null {
  if (values.length > MAX_SLOTS_PER_USER) return null;
  const keys = new Set<string>();
  for (const value of values) {
    if (typeof value !== "string" || !SLOT_KEY_PATTERN.test(value)) return null;
    keys.add(value);
  }
  return keys;
}

// นัดหมายต้องอยู่ในวันเดียว: startSlot + จำนวนช่อง ต้องไม่เกินสิ้นวัน
export function validateEventRange(startSlot: number, slotCount: number): EventRangeResult {
  if (!Number.isInteger(startSlot) || startSlot < 0 || startSlot >= SLOTS_PER_DAY) {
    return { ok: false, error: "ช่วงเวลาเริ่มต้นไม่ถูกต้อง" };
  }
  if (!Number.isInteger(slotCount) || slotCount < 1) {
    return { ok: false, error: "ระยะเวลานัดหมายต้องมีอย่างน้อย 1 ช่อง (30 นาที)" };
  }
  if (startSlot + slotCount > SLOTS_PER_DAY) {
    return { ok: false, error: "ระยะเวลานัดหมายเกินสิ้นวัน (24:00)" };
  }
  return { ok: true, endSlot: startSlot + slotCount };
}

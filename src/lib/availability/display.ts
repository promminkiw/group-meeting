import { SLOTS_PER_DAY } from "./heatmap";

export const DAY_LABELS = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"] as const;
export const DAY_SHORT_LABELS = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."] as const;

// ช่วงเริ่มต้น 06:00-24:00 (slot 12-47); "all" แสดงทั้งวัน
export const DEFAULT_VISIBLE_START_SLOT = 12;
export type CalendarView = "default" | "all";

export function parseCalendarView(value: string | string[] | undefined): CalendarView {
  return value === "all" ? "all" : "default";
}

export function visibleSlotRange(view: CalendarView): { start: number; end: number } {
  return { start: view === "all" ? 0 : DEFAULT_VISIBLE_START_SLOT, end: SLOTS_PER_DAY };
}

// 0 = ไม่มีใครว่าง, 1-4 = สัดส่วนคนว่างเพิ่มขึ้น (ใช้กับ computeIntensity)
export type HeatLevel = 0 | 1 | 2 | 3 | 4;

export function heatLevel(intensity: number): HeatLevel {
  if (!(intensity > 0)) return 0;
  if (intensity <= 0.25) return 1;
  if (intensity <= 0.5) return 2;
  if (intensity <= 0.75) return 3;
  return 4;
}

// คู่สีพื้น/ตัวอักษรที่ตรวจ contrast แล้ว (ตัวเลขในช่องบอกค่าจริงเสมอ ไม่พึ่งสีอย่างเดียว)
export const HEAT_LEVEL_CLASSES: Record<HeatLevel, string> = {
  0: "bg-white text-ink-subtle",
  1: "bg-primary-100 text-primary-900",
  2: "bg-primary-300 text-[#1E1B4B]",
  3: "bg-primary-600 text-white",
  4: "bg-primary-900 text-white",
};

export function slotRangeLabel(startSlot: number, endSlot: number): string {
  const format = (boundary: number) =>
    `${String(Math.floor(boundary / 2)).padStart(2, "0")}:${boundary % 2 === 0 ? "00" : "30"}`;
  return `${format(startSlot)}-${format(endSlot)}`;
}

export function durationLabel(slotCount: number): string {
  const minutes = slotCount * 30;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} นาที`;
  return rest === 0 ? `${hours} ชั่วโมง` : `${hours} ชั่วโมง ${rest} นาที`;
}

const eventDateFormatter = new Intl.DateTimeFormat("th-TH", {
  timeZone: "Asia/Bangkok",
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

const eventTimeFormatter = new Intl.DateTimeFormat("th-TH", {
  timeZone: "Asia/Bangkok",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

// เที่ยงคืนปลายช่วงแสดงเป็น 24:00 เพื่อไม่ให้สับสนกับต้นวัน
export function formatEventRange(startsAtIso: string, endsAtIso: string): string {
  const start = new Date(startsAtIso);
  const end = new Date(endsAtIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "";
  const endTime = eventTimeFormatter.format(end);
  return `${eventDateFormatter.format(start)} ${eventTimeFormatter.format(start)}-${endTime === "00:00" ? "24:00" : endTime}`;
}

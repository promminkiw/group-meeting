import { isUuid } from "@/lib/groups/validation";
import { slotToIso, validateEventRange, weekdayOfDateString } from "./slots";

export const EVENT_TITLE_MAX_LENGTH = 200;
export const EVENT_DESCRIPTION_MAX_LENGTH = 2000;

export type RawEventInput = {
  groupId: string;
  title: string;
  description: string;
  date: string;
  dayOfWeek: string;
  startSlot: string;
  slotCount: string;
};

export type EventInput = {
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
};

export type EventInputResult = { ok: true; value: EventInput } | { ok: false; error: string };

function charLength(value: string): number {
  return [...value].length;
}

// เลขเต็มที่ไม่มีเครื่องหมาย/ทศนิยม; ผิดรูปแบบคืน NaN
function toStrictInteger(value: string): number {
  return /^\d{1,3}$/.test(value) ? Number(value) : Number.NaN;
}

// ตรวจข้อมูลนัดหมายจากฟอร์ม รวมว่าวันที่ที่เลือกตรงกับ weekday ของช่อง
export function parseEventInput(raw: RawEventInput): EventInputResult {
  if (!isUuid(raw.groupId)) return { ok: false, error: "ข้อมูลกลุ่มไม่ถูกต้อง" };

  const title = raw.title.trim();
  if (title === "") return { ok: false, error: "กรุณากรอกชื่อนัดหมาย" };
  if (charLength(title) > EVENT_TITLE_MAX_LENGTH) {
    return { ok: false, error: `ชื่อนัดหมายต้องไม่เกิน ${EVENT_TITLE_MAX_LENGTH} ตัวอักษร` };
  }

  const description = raw.description.trim();
  if (charLength(description) > EVENT_DESCRIPTION_MAX_LENGTH) {
    return { ok: false, error: `รายละเอียดต้องไม่เกิน ${EVENT_DESCRIPTION_MAX_LENGTH} ตัวอักษร` };
  }

  const dayOfWeek = toStrictInteger(raw.dayOfWeek);
  const dateWeekday = weekdayOfDateString(raw.date);
  if (dateWeekday === null) return { ok: false, error: "รูปแบบวันที่ไม่ถูกต้อง" };
  if (dateWeekday !== dayOfWeek) {
    return { ok: false, error: "วันที่ที่เลือกไม่ตรงกับวันในสัปดาห์ของช่องเวลา" };
  }

  const range = validateEventRange(toStrictInteger(raw.startSlot), toStrictInteger(raw.slotCount));
  if (!range.ok) return range;

  const startsAt = slotToIso(raw.date, toStrictInteger(raw.startSlot));
  const endsAt = slotToIso(raw.date, range.endSlot);
  if (!startsAt || !endsAt) return { ok: false, error: "รูปแบบวันที่ไม่ถูกต้อง" };

  return {
    ok: true,
    value: { title, description: description === "" ? null : description, startsAt, endsAt },
  };
}

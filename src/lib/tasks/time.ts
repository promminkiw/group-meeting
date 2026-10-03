export const APP_TIME_ZONE = "Asia/Bangkok";

// ไทยไม่มี DST จึงใช้ offset คงที่ +07:00 ได้
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const LOCAL_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;

const deadlineFormatter = new Intl.DateTimeFormat("th-TH", {
  timeZone: APP_TIME_ZONE,
  dateStyle: "medium",
  timeStyle: "short",
  hourCycle: "h23",
});

// วันที่ตามเวลาไทยในรูป YYYY-MM-DD ใช้เทียบ "วันเดียวกัน"
export function bangkokDayKey(date: Date): string {
  return new Date(date.getTime() + BANGKOK_OFFSET_MS).toISOString().slice(0, 10);
}

// เวลา 00:00 ของวันตามเวลาไทย ณ ช่วงเวลาที่ให้มา
export function bangkokDayStart(date: Date): Date {
  const shifted = date.getTime() + BANGKOK_OFFSET_MS;
  const dayStart = shifted - (((shifted % DAY_MS) + DAY_MS) % DAY_MS);
  return new Date(dayStart - BANGKOK_OFFSET_MS);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

// ค่าจาก <input type="datetime-local"> (เวลาไทย) -> ISO UTC; คืน null ถ้าว่างหรือไม่ถูกต้อง
export function fromDateTimeLocalValue(value: string): string | null {
  const match = LOCAL_PATTERN.exec(value.trim());
  if (!match) return null;

  const [year, month, day, hour, minute, second] = match.slice(1).map((part) => Number(part ?? 0));
  const utcMs = Date.UTC(year, month - 1, day, hour, minute, second);
  const check = new Date(utcMs);
  // กันวันที่ที่ Date ปัดให้เอง เช่น 31 ก.พ.
  const isRealDate =
    check.getUTCFullYear() === year &&
    check.getUTCMonth() === month - 1 &&
    check.getUTCDate() === day &&
    check.getUTCHours() === hour &&
    check.getUTCMinutes() === minute;
  if (!isRealDate) return null;

  return new Date(utcMs - BANGKOK_OFFSET_MS).toISOString();
}

// ISO -> ค่าที่ใส่ใน datetime-local (เวลาไทย); คืนสตริงว่างถ้าไม่มีค่า
// ใส่วินาทีเฉพาะเมื่อไม่ใช่ 0 เพื่อไม่ให้วินาทีหายเงียบๆ ตอนบันทึกซ้ำ
export function toDateTimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() + BANGKOK_OFFSET_MS).toISOString();
  return date.getUTCSeconds() === 0 ? local.slice(0, 16) : local.slice(0, 19);
}

export function formatDeadline(iso: string | null | undefined): string {
  if (!iso) return "ไม่กำหนด";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "ไม่กำหนด";
  return deadlineFormatter.format(date);
}

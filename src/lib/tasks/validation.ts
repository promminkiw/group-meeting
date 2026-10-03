import { isUuid } from "@/lib/groups/validation";
import { fromDateTimeLocalValue } from "./time";

export const TASK_TITLE_MAX_LENGTH = 200;
export const TASK_DESCRIPTION_MAX_LENGTH = 2000;

export type TaskInput = {
  title: string;
  description: string | null;
  deadline: string | null;
};

export type TaskInputResult = { ok: true; value: TaskInput } | { ok: false; error: string };

function charLength(value: string): number {
  return [...value].length;
}

// ตรงกับ check ใน database: title 1-200 ตัวอักษร
export function parseTaskInput(raw: {
  title: string;
  description: string;
  deadline: string;
}): TaskInputResult {
  const title = raw.title.trim();
  if (title === "") return { ok: false, error: "กรุณากรอกชื่องาน" };
  if (charLength(title) > TASK_TITLE_MAX_LENGTH) {
    return { ok: false, error: `ชื่องานต้องไม่เกิน ${TASK_TITLE_MAX_LENGTH} ตัวอักษร` };
  }

  const description = raw.description.trim();
  if (charLength(description) > TASK_DESCRIPTION_MAX_LENGTH) {
    return { ok: false, error: `รายละเอียดต้องไม่เกิน ${TASK_DESCRIPTION_MAX_LENGTH} ตัวอักษร` };
  }

  let deadline: string | null = null;
  if (raw.deadline.trim() !== "") {
    deadline = fromDateTimeLocalValue(raw.deadline);
    if (!deadline) return { ok: false, error: "รูปแบบวันและเวลากำหนดส่งไม่ถูกต้อง" };
  }

  return { ok: true, value: { title, description: description === "" ? null : description, deadline } };
}

// คืนเฉพาะ uuid ที่ไม่ซ้ำ; null ถ้ามีค่าที่ไม่ใช่ uuid
export function parseAssigneeIds(values: readonly FormDataEntryValue[]): string[] | null {
  const ids = new Set<string>();
  for (const value of values) {
    if (typeof value !== "string" || !isUuid(value)) return null;
    ids.add(value.toLowerCase());
  }
  return [...ids];
}

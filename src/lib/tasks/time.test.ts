import { describe, expect, it } from "vitest";
import {
  bangkokDayKey,
  bangkokDayStart,
  formatDeadline,
  fromDateTimeLocalValue,
  toDateTimeLocalValue,
} from "./time";

describe("fromDateTimeLocalValue", () => {
  it("แปลงเวลาไทยเป็น UTC (ลบ 7 ชั่วโมง)", () => {
    expect(fromDateTimeLocalValue("2026-10-03T14:30")).toBe("2026-10-03T07:30:00.000Z");
  });
  it("ข้ามวันเมื่อเวลาไทยก่อน 07:00", () => {
    expect(fromDateTimeLocalValue("2026-10-03T03:00")).toBe("2026-10-02T20:00:00.000Z");
  });
  it("รับวินาทีได้", () => {
    expect(fromDateTimeLocalValue("2026-10-03T14:30:15")).toBe("2026-10-03T07:30:15.000Z");
  });
  it.each(["", "abc", "2026-10-03", "2026-02-31T10:00", "2026-13-01T10:00", "2026-10-03T25:00", "2026-10-03T10:61"])(
    "คืน null สำหรับ %j",
    (value) => {
      expect(fromDateTimeLocalValue(value)).toBeNull();
    },
  );
});

describe("toDateTimeLocalValue", () => {
  it("แปลง UTC กลับเป็นเวลาไทย", () => {
    expect(toDateTimeLocalValue("2026-10-03T07:30:00.000Z")).toBe("2026-10-03T14:30");
  });
  it("round trip", () => {
    const local = "2026-12-31T23:59";
    expect(toDateTimeLocalValue(fromDateTimeLocalValue(local))).toBe(local);
  });
  it("คงวินาทีไว้เมื่อไม่ใช่ศูนย์", () => {
    expect(toDateTimeLocalValue("2026-10-03T07:30:15.000Z")).toBe("2026-10-03T14:30:15");
    expect(toDateTimeLocalValue("2026-10-03T07:30:00.000Z")).toBe("2026-10-03T14:30");
  });
  it("คืนสตริงว่างเมื่อไม่มีค่าหรือค่าเสีย", () => {
    expect(toDateTimeLocalValue(null)).toBe("");
    expect(toDateTimeLocalValue("not a date")).toBe("");
  });
});

describe("formatDeadline", () => {
  it("แสดงตามเวลาไทยเป็นภาษาไทย", () => {
    const text = formatDeadline("2026-10-03T17:30:00.000Z");
    expect(text).toContain("00:30");
    expect(text).toContain("ต.ค.");
    expect(text).toContain("2569");
  });
  it("ไม่มี deadline", () => {
    expect(formatDeadline(null)).toBe("ไม่กำหนด");
    expect(formatDeadline("garbage")).toBe("ไม่กำหนด");
  });
});

describe("bangkokDay helpers", () => {
  it("dayKey ใช้วันตามเวลาไทย", () => {
    expect(bangkokDayKey(new Date("2026-10-03T17:00:00Z"))).toBe("2026-10-04");
    expect(bangkokDayKey(new Date("2026-10-03T16:59:59Z"))).toBe("2026-10-03");
  });
  it("dayStart คือ 00:00 เวลาไทย", () => {
    expect(bangkokDayStart(new Date("2026-10-03T10:00:00Z")).toISOString()).toBe("2026-10-02T17:00:00.000Z");
    expect(bangkokDayStart(new Date("2026-10-02T17:00:00Z")).toISOString()).toBe("2026-10-02T17:00:00.000Z");
  });
});

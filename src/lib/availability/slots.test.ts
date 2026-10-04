import { describe, expect, it } from "vitest";
import { formatEventRange, heatLevel, parseCalendarView, visibleSlotRange } from "./display";
import { parseEventInput, type RawEventInput } from "./events";
import {
  diffSlots,
  keySetToSlots,
  nextOccurrenceDate,
  nextSlotDate,
  parseSlotKey,
  parseSlotKeys,
  slotsToKeySet,
  slotToIso,
  toSlotKey,
  validateEventRange,
  weekdayIndexMondayFirst,
  weekdayOfDateString,
} from "./slots";

describe("weekdayIndexMondayFirst", () => {
  it("แปลง 0=อาทิตย์ ของ JS เป็น 6", () => {
    // 2026-10-04 เป็นวันอาทิตย์
    expect(weekdayIndexMondayFirst(new Date("2026-10-04T05:00:00Z"))).toBe(6);
  });
  it("จันทร์ = 0", () => {
    expect(weekdayIndexMondayFirst(new Date("2026-10-05T05:00:00Z"))).toBe(0);
  });
  it("ใช้เวลาไทย: 17:00 UTC เสาร์ = 00:00 อาทิตย์ในไทย", () => {
    expect(weekdayIndexMondayFirst(new Date("2026-10-03T16:59:59Z"))).toBe(5);
    expect(weekdayIndexMondayFirst(new Date("2026-10-03T17:00:00Z"))).toBe(6);
  });
  it("ข้ามจากอาทิตย์เป็นจันทร์ตามเวลาไทย", () => {
    expect(weekdayIndexMondayFirst(new Date("2026-10-04T17:00:00Z"))).toBe(0);
  });
});

describe("nextOccurrenceDate", () => {
  // 2026-10-03 เป็นวันเสาร์ (index 5)
  const saturday = new Date("2026-10-03T05:00:00Z");
  it("รวมวันนี้ถ้าตรง", () => {
    expect(nextOccurrenceDate(5, saturday)).toBe("2026-10-03");
  });
  it("วันถัดไป", () => {
    expect(nextOccurrenceDate(6, saturday)).toBe("2026-10-04");
  });
  it("วนข้ามสัปดาห์ (จันทร์หลังเสาร์)", () => {
    expect(nextOccurrenceDate(0, saturday)).toBe("2026-10-05");
  });
  it("วันที่ผ่านไปแล้วของสัปดาห์นี้ไปสัปดาห์หน้า (ศุกร์หลังเสาร์)", () => {
    expect(nextOccurrenceDate(4, saturday)).toBe("2026-10-09");
  });
  it("ใช้วันตามเวลาไทยเมื่อ UTC ยังเป็นวันก่อนหน้า", () => {
    // 20:00 UTC เสาร์ = 03:00 อาทิตย์ในไทย
    expect(nextOccurrenceDate(6, new Date("2026-10-03T20:00:00Z"))).toBe("2026-10-04");
    expect(nextOccurrenceDate(5, new Date("2026-10-03T20:00:00Z"))).toBe("2026-10-10");
  });
  it("ข้ามเดือนและปีได้", () => {
    // 2026-12-31 เป็นวันพฤหัสบดี (3); จันทร์ถัดไป = 2027-01-04
    expect(nextOccurrenceDate(0, new Date("2026-12-31T05:00:00Z"))).toBe("2027-01-04");
  });
  it("คืน null เมื่อ dayOfWeek ไม่ถูกต้อง", () => {
    expect(nextOccurrenceDate(7, saturday)).toBeNull();
    expect(nextOccurrenceDate(-1, saturday)).toBeNull();
    expect(nextOccurrenceDate(1.5, saturday)).toBeNull();
  });
});

describe("nextSlotDate", () => {
  // 05:00 UTC เสาร์ 2026-10-03 = 12:00 เสาร์ในไทย
  const saturdayNoon = new Date("2026-10-03T05:00:00Z");
  it("ช่องของวันนี้ที่ยังไม่จบใช้วันนี้", () => {
    expect(nextSlotDate(5, 24, saturdayNoon)).toBe("2026-10-03");
    expect(nextSlotDate(5, 47, saturdayNoon)).toBe("2026-10-03");
  });
  it("ช่องของวันนี้ที่จบพอดีหรือผ่านไปแล้วเลื่อนไปสัปดาห์หน้า", () => {
    // ช่อง 23 = 11:30-12:00 จบพอดีตอนนี้
    expect(nextSlotDate(5, 23, saturdayNoon)).toBe("2026-10-10");
    expect(nextSlotDate(5, 0, saturdayNoon)).toBe("2026-10-10");
  });
  it("วันอื่นไม่เปลี่ยนจาก nextOccurrenceDate", () => {
    expect(nextSlotDate(6, 0, saturdayNoon)).toBe("2026-10-04");
    expect(nextSlotDate(4, 0, saturdayNoon)).toBe("2026-10-09");
  });
  it("เลื่อนข้ามปีได้", () => {
    // 2026-12-31 เป็นวันพฤหัสบดี (3), 05:00 UTC = 12:00 ในไทย
    expect(nextSlotDate(3, 0, new Date("2026-12-31T05:00:00Z"))).toBe("2027-01-07");
  });
  it("คืน null เมื่อวันหรือช่องไม่ถูกต้อง", () => {
    expect(nextSlotDate(7, 0, saturdayNoon)).toBeNull();
    expect(nextSlotDate(5, 48, saturdayNoon)).toBeNull();
    expect(nextSlotDate(5, -2, saturdayNoon)).toBeNull();
  });
});

describe("weekdayOfDateString", () => {
  it("หา weekday ของวันที่", () => {
    expect(weekdayOfDateString("2026-10-05")).toBe(0);
    expect(weekdayOfDateString("2026-10-04")).toBe(6);
  });
  it.each(["", "2026-02-30", "2026-13-01", "26-10-05", "2026-10-5", "2026-10-05T00:00"])(
    "คืน null สำหรับ %j",
    (value) => {
      expect(weekdayOfDateString(value)).toBeNull();
    },
  );
});

describe("slotToIso", () => {
  it("slot 0 = 00:00 ไทย = 17:00 UTC ของวันก่อนหน้า", () => {
    expect(slotToIso("2026-10-05", 0)).toBe("2026-10-04T17:00:00.000Z");
  });
  it("slot 19 = 09:30 ไทย", () => {
    expect(slotToIso("2026-10-05", 19)).toBe("2026-10-05T02:30:00.000Z");
  });
  it("slot 47 เริ่ม 23:30 ไทย", () => {
    expect(slotToIso("2026-10-05", 47)).toBe("2026-10-05T16:30:00.000Z");
  });
  it("ปลายช่อง 48 = เที่ยงคืนวันถัดไป", () => {
    expect(slotToIso("2026-10-05", 48)).toBe("2026-10-05T17:00:00.000Z");
  });
  it("ข้ามสิ้นเดือนและปี", () => {
    expect(slotToIso("2026-12-31", 48)).toBe("2026-12-31T17:00:00.000Z");
    expect(slotToIso("2026-01-01", 0)).toBe("2025-12-31T17:00:00.000Z");
  });
  it("คืน null เมื่อ input ไม่ถูกต้อง", () => {
    expect(slotToIso("2026-10-05", 49)).toBeNull();
    expect(slotToIso("2026-10-05", -1)).toBeNull();
    expect(slotToIso("2026-10-05", 1.5)).toBeNull();
    expect(slotToIso("2026-02-30", 0)).toBeNull();
    expect(slotToIso("bad", 0)).toBeNull();
  });
});

describe("slot key helpers", () => {
  it("แปลงไป-กลับ", () => {
    expect(toSlotKey(2, 10)).toBe("2:10");
    expect(parseSlotKey("2:10")).toEqual({ dayOfWeek: 2, slotIndex: 10 });
    const set = slotsToKeySet([
      { dayOfWeek: 0, slotIndex: 0 },
      { dayOfWeek: 6, slotIndex: 47 },
      { dayOfWeek: 0, slotIndex: 0 },
    ]);
    expect(set.size).toBe(2);
    expect(keySetToSlots(set)).toEqual([
      { dayOfWeek: 0, slotIndex: 0 },
      { dayOfWeek: 6, slotIndex: 47 },
    ]);
  });
  it.each(["7:0", "0:48", "-1:0", "0:-1", "0:01", "00:1", "1.5:2", "a:b", "1:2:3", "", " 1:2", "1:2 "])(
    "parseSlotKey ปฏิเสธ %j",
    (key) => {
      expect(parseSlotKey(key)).toBeNull();
    },
  );
});

describe("diffSlots", () => {
  it("เพิ่มเฉพาะที่ใหม่ ลบเฉพาะที่เอาออก", () => {
    const diff = diffSlots(new Set(["0:1", "0:2", "1:5"]), new Set(["0:2", "1:5", "3:3"]));
    expect(diff.toInsert).toEqual(["3:3"]);
    expect(diff.toDelete).toEqual(["0:1"]);
  });
  it("ไม่เปลี่ยนแปลงเมื่อเท่ากัน", () => {
    expect(diffSlots(new Set(["0:1"]), new Set(["0:1"]))).toEqual({ toInsert: [], toDelete: [] });
  });
  it("ล้างทั้งหมด", () => {
    expect(diffSlots(new Set(["0:1", "0:2"]), new Set())).toEqual({
      toInsert: [],
      toDelete: ["0:1", "0:2"],
    });
  });
  it("เริ่มจากว่าง", () => {
    expect(diffSlots(new Set(), new Set(["6:47"]))).toEqual({ toInsert: ["6:47"], toDelete: [] });
  });
});

describe("parseSlotKeys", () => {
  it("รับค่าถูกต้องและตัดซ้ำ", () => {
    expect(parseSlotKeys(["0:0", "0:0", "6:47"])).toEqual(new Set(["0:0", "6:47"]));
  });
  it("รับรายการว่าง", () => {
    expect(parseSlotKeys([])).toEqual(new Set());
  });
  it("ปฏิเสธค่าผิดรูปแบบหรือนอกช่วง", () => {
    expect(parseSlotKeys(["0:0", "7:0"])).toBeNull();
    expect(parseSlotKeys(["0:48"])).toBeNull();
    expect(parseSlotKeys(["x"])).toBeNull();
  });
  it("ปฏิเสธไฟล์ (ไม่ใช่ string)", () => {
    expect(parseSlotKeys([new File([], "a.txt")])).toBeNull();
  });
  it("ปฏิเสธจำนวนเกิน 336 แต่รับครบ 336 พอดี", () => {
    const all: string[] = [];
    for (let d = 0; d < 7; d++) for (let s = 0; s < 48; s++) all.push(`${d}:${s}`);
    expect(parseSlotKeys(all)?.size).toBe(336);
    expect(parseSlotKeys([...all, "0:0"])).toBeNull();
  });
});

describe("validateEventRange", () => {
  it("ช่องเดียวในช่วงแรกและช่วงสุดท้าย", () => {
    expect(validateEventRange(0, 1)).toEqual({ ok: true, endSlot: 1 });
    expect(validateEventRange(47, 1)).toEqual({ ok: true, endSlot: 48 });
  });
  it("ทั้งวัน", () => {
    expect(validateEventRange(0, 48)).toEqual({ ok: true, endSlot: 48 });
  });
  it("ปฏิเสธเกินสิ้นวัน", () => {
    expect(validateEventRange(47, 2).ok).toBe(false);
    expect(validateEventRange(0, 49).ok).toBe(false);
  });
  it("ปฏิเสธจำนวนช่องไม่ถูกต้อง", () => {
    expect(validateEventRange(10, 0).ok).toBe(false);
    expect(validateEventRange(10, -1).ok).toBe(false);
    expect(validateEventRange(10, 1.5).ok).toBe(false);
    expect(validateEventRange(10, Number.NaN).ok).toBe(false);
  });
  it("ปฏิเสธ startSlot นอกช่วง", () => {
    expect(validateEventRange(-1, 1).ok).toBe(false);
    expect(validateEventRange(48, 1).ok).toBe(false);
  });
});

describe("parseEventInput", () => {
  const base: RawEventInput = {
    groupId: "11111111-1111-4111-8111-111111111111",
    title: "  ประชุมกลุ่ม ",
    description: "",
    date: "2026-10-05",
    dayOfWeek: "0",
    startSlot: "19",
    slotCount: "3",
  };
  it("สร้างช่วงเวลา UTC จากเวลาไทย", () => {
    const result = parseEventInput(base);
    expect(result).toEqual({
      ok: true,
      value: {
        title: "ประชุมกลุ่ม",
        description: null,
        startsAt: "2026-10-05T02:30:00.000Z",
        endsAt: "2026-10-05T04:00:00.000Z",
      },
    });
  });
  it("ปฏิเสธวันที่ที่ weekday ไม่ตรงกับช่อง", () => {
    expect(parseEventInput({ ...base, dayOfWeek: "1" }).ok).toBe(false);
  });
  it("ปฏิเสธชื่อว่างหรือยาวเกิน 200", () => {
    expect(parseEventInput({ ...base, title: "   " }).ok).toBe(false);
    expect(parseEventInput({ ...base, title: "ก".repeat(201) }).ok).toBe(false);
    expect(parseEventInput({ ...base, title: "ก".repeat(200) }).ok).toBe(true);
  });
  it("ปฏิเสธช่วงเกินสิ้นวัน วันที่ผิด และ groupId ผิด", () => {
    expect(parseEventInput({ ...base, startSlot: "47", slotCount: "2" }).ok).toBe(false);
    expect(parseEventInput({ ...base, date: "2026-02-30" }).ok).toBe(false);
    expect(parseEventInput({ ...base, groupId: "x" }).ok).toBe(false);
    expect(parseEventInput({ ...base, startSlot: "abc" }).ok).toBe(false);
  });
  it("ช่องสุดท้ายของวันจบที่เที่ยงคืนวันถัดไป", () => {
    const result = parseEventInput({ ...base, startSlot: "47", slotCount: "1" });
    expect(result.ok && result.value.endsAt).toBe("2026-10-05T17:00:00.000Z");
  });
});

describe("display helpers", () => {
  it("heatLevel แบ่งระดับตามสัดส่วน", () => {
    expect(heatLevel(0)).toBe(0);
    expect(heatLevel(Number.NaN)).toBe(0);
    expect(heatLevel(0.1)).toBe(1);
    expect(heatLevel(0.25)).toBe(1);
    expect(heatLevel(0.5)).toBe(2);
    expect(heatLevel(0.75)).toBe(3);
    expect(heatLevel(1)).toBe(4);
  });
  it("ช่วงที่แสดง", () => {
    expect(parseCalendarView("all")).toBe("all");
    expect(parseCalendarView(["all"])).toBe("default");
    expect(parseCalendarView(undefined)).toBe("default");
    expect(visibleSlotRange("default")).toEqual({ start: 12, end: 48 });
    expect(visibleSlotRange("all")).toEqual({ start: 0, end: 48 });
  });
  it("formatEventRange แสดง 24:00 เมื่อจบที่เที่ยงคืน", () => {
    const text = formatEventRange("2026-10-05T16:30:00.000Z", "2026-10-05T17:00:00.000Z");
    expect(text).toMatch(/23:30-24:00$/);
    expect(formatEventRange("bad", "bad")).toBe("");
  });
});

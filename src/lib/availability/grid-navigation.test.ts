import { describe, expect, it } from "vitest";
import { nextGridPosition } from "./grid-navigation";

const fullDay = { startSlot: 0, endSlot: 48 };
// view 06:00-24:00
const daytime = { startSlot: 12, endSlot: 48 };

describe("nextGridPosition", () => {
  it("ลูกศรซ้าย/ขวาเปลี่ยนวัน ลูกศรขึ้น/ลงเปลี่ยนเวลา", () => {
    const from = { day: 3, slot: 20 };
    expect(nextGridPosition(from, "ArrowRight", fullDay)).toEqual({ day: 4, slot: 20 });
    expect(nextGridPosition(from, "ArrowLeft", fullDay)).toEqual({ day: 2, slot: 20 });
    expect(nextGridPosition(from, "ArrowDown", fullDay)).toEqual({ day: 3, slot: 21 });
    expect(nextGridPosition(from, "ArrowUp", fullDay)).toEqual({ day: 3, slot: 19 });
  });

  it("ไม่เลื่อนเกินขอบตาราง", () => {
    expect(nextGridPosition({ day: 6, slot: 47 }, "ArrowRight", fullDay)).toEqual({ day: 6, slot: 47 });
    expect(nextGridPosition({ day: 6, slot: 47 }, "ArrowDown", fullDay)).toEqual({ day: 6, slot: 47 });
    expect(nextGridPosition({ day: 0, slot: 0 }, "ArrowLeft", fullDay)).toEqual({ day: 0, slot: 0 });
    expect(nextGridPosition({ day: 0, slot: 0 }, "ArrowUp", fullDay)).toEqual({ day: 0, slot: 0 });
  });

  it("ขอบบนใช้ startSlot ของ view", () => {
    expect(nextGridPosition({ day: 2, slot: 12 }, "ArrowUp", daytime)).toEqual({ day: 2, slot: 12 });
    expect(nextGridPosition({ day: 2, slot: 14 }, "PageUp", daytime)).toEqual({ day: 2, slot: 12 });
  });

  it("PageUp/PageDown เลื่อนทีละ 2 ชั่วโมง", () => {
    expect(nextGridPosition({ day: 1, slot: 20 }, "PageDown", fullDay)).toEqual({ day: 1, slot: 24 });
    expect(nextGridPosition({ day: 1, slot: 20 }, "PageUp", fullDay)).toEqual({ day: 1, slot: 16 });
    expect(nextGridPosition({ day: 1, slot: 46 }, "PageDown", fullDay)).toEqual({ day: 1, slot: 47 });
  });

  it("Home/End ไปต้น/ท้ายแถว และ Ctrl+Home/End ไปมุมตาราง", () => {
    expect(nextGridPosition({ day: 3, slot: 20 }, "Home", daytime)).toEqual({ day: 0, slot: 20 });
    expect(nextGridPosition({ day: 3, slot: 20 }, "End", daytime)).toEqual({ day: 6, slot: 20 });
    expect(nextGridPosition({ day: 3, slot: 20 }, "Home", daytime, true)).toEqual({ day: 0, slot: 12 });
    expect(nextGridPosition({ day: 3, slot: 20 }, "End", daytime, true)).toEqual({ day: 6, slot: 47 });
  });

  it("ปุ่มอื่นคืน null เพื่อไม่ขวาง Tab, Space, Enter", () => {
    for (const key of ["Tab", " ", "Enter", "a"]) {
      expect(nextGridPosition({ day: 0, slot: 0 }, key, fullDay)).toBeNull();
    }
  });
});

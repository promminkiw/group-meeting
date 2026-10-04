import { DAYS_PER_WEEK } from "./heatmap";

export type GridPosition = { day: number; slot: number };

// ช่วงช่องที่แสดง [startSlot, endSlot) ตาม view ของหน้า
export type GridBounds = { startSlot: number; endSlot: number };

// PageUp/PageDown เลื่อนทีละ 2 ชั่วโมง
const PAGE_SLOTS = 4;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// แถว = ช่วงเวลา, คอลัมน์ = วัน (ตรงกับตารางบนหน้าจอ); null = ไม่ใช่ปุ่มที่ใช้เลื่อน
export function nextGridPosition(
  position: GridPosition,
  key: string,
  bounds: GridBounds,
  ctrlKey = false,
): GridPosition | null {
  const lastDay = DAYS_PER_WEEK - 1;
  const firstSlot = bounds.startSlot;
  const lastSlot = bounds.endSlot - 1;
  const { day, slot } = position;

  switch (key) {
    case "ArrowRight":
      return { day: clamp(day + 1, 0, lastDay), slot };
    case "ArrowLeft":
      return { day: clamp(day - 1, 0, lastDay), slot };
    case "ArrowDown":
      return { day, slot: clamp(slot + 1, firstSlot, lastSlot) };
    case "ArrowUp":
      return { day, slot: clamp(slot - 1, firstSlot, lastSlot) };
    case "PageDown":
      return { day, slot: clamp(slot + PAGE_SLOTS, firstSlot, lastSlot) };
    case "PageUp":
      return { day, slot: clamp(slot - PAGE_SLOTS, firstSlot, lastSlot) };
    case "Home":
      return ctrlKey ? { day: 0, slot: firstSlot } : { day: 0, slot };
    case "End":
      return ctrlKey ? { day: lastDay, slot: lastSlot } : { day: lastDay, slot };
    default:
      return null;
  }
}

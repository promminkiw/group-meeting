"use client";

import { useState, type KeyboardEvent } from "react";
import { nextGridPosition, type GridBounds, type GridPosition } from "./grid-navigation";

const CELL_ATTRIBUTE = "data-grid-cell";

function cellId(day: number, slot: number): string {
  return `${day}:${slot}`;
}

// roving tabindex: Tab เข้าตารางได้ครั้งเดียว แล้วใช้ลูกศรเลื่อนในตาราง (แทน Tab ผ่าน 300+ ช่อง)
export function useRovingGrid(bounds: GridBounds) {
  const [active, setActive] = useState<GridPosition>({ day: 0, slot: bounds.startSlot });

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!(event.target instanceof HTMLElement)) return;
    const current = event.target.closest<HTMLElement>(`[${CELL_ATTRIBUTE}]`)?.getAttribute(CELL_ATTRIBUTE);
    if (!current) return;
    const [day, slot] = current.split(":").map(Number);
    const next = nextGridPosition({ day, slot }, event.key, bounds, event.ctrlKey || event.metaKey);
    if (!next) return;

    event.preventDefault();
    setActive(next);
    event.currentTarget
      .querySelector<HTMLElement>(`[${CELL_ATTRIBUTE}="${cellId(next.day, next.slot)}"]`)
      ?.focus();
  }

  function cellProps(day: number, slot: number) {
    return {
      [CELL_ATTRIBUTE]: cellId(day, slot),
      tabIndex: active.day === day && active.slot === slot ? 0 : -1,
      // คลิกด้วยเมาส์แล้วให้ช่องนั้นเป็นจุดเริ่มของคีย์บอร์ดต่อ
      onFocus: () => setActive({ day, slot }),
    };
  }

  return { handleKeyDown, cellProps };
}

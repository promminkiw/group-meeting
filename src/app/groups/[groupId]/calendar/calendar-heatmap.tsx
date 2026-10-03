"use client";

import { useEffect, useRef, useState } from "react";
import {
  DAY_LABELS,
  DAY_SHORT_LABELS,
  HEAT_LEVEL_CLASSES,
  heatLevel,
  slotRangeLabel,
} from "@/lib/availability/display";
import {
  computeIntensity,
  DAYS_PER_WEEK,
  getSlotDetail,
  slotIndexToTimeLabel,
  type AvailabilitySlot,
} from "@/lib/availability/heatmap";
import { CreateEventForm } from "./create-event-form";

const DAYS = Array.from({ length: DAYS_PER_WEEK }, (_, day) => day);

type MemberOption = { userId: string; displayName: string };

type Props = {
  groupId: string;
  grid: number[][];
  slots: AvailabilitySlot[];
  members: MemberOption[];
  startSlot: number;
  endSlot: number;
  // วันที่ถัดไปของแต่ละ weekday คำนวณฝั่ง server เพื่อไม่ให้ขึ้นกับ timezone ของเบราว์เซอร์
  nextDates: (string | null)[];
  canCreateEvent: boolean;
};

type Selection = { day: number; slot: number };

export function CalendarHeatmap({
  groupId,
  grid,
  slots,
  members,
  startSlot,
  endSlot,
  nextDates,
  canCreateEvent,
}: Props) {
  const [selection, setSelection] = useState<Selection | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selection) detailRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selection]);

  const memberIds = members.map((member) => member.userId);
  const nameById = new Map(members.map((member) => [member.userId, member.displayName]));
  const visibleSlots = Array.from({ length: endSlot - startSlot }, (_, offset) => startSlot + offset);
  const detail = selection ? getSlotDetail(slots, memberIds, selection.day, selection.slot) : null;
  const nameOf = (userId: string) => nameById.get(userId) ?? "ไม่ทราบชื่อ";

  return (
    <div className="space-y-4">
      <div className="max-h-[70vh] overflow-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full min-w-[26rem] border-separate border-spacing-0 text-center">
          <caption className="sr-only">
            ตารางจำนวนสมาชิกที่ว่างในแต่ละช่วงเวลา ช่องละ 30 นาที กดช่องเพื่อดูรายชื่อ
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 top-0 z-30 border-b border-r border-zinc-200 bg-zinc-50 px-2 py-2 text-xs font-medium text-zinc-700"
              >
                เวลา
              </th>
              {DAYS.map((day) => (
                <th
                  key={day}
                  scope="col"
                  className="sticky top-0 z-20 border-b border-zinc-200 bg-zinc-50 px-1 py-2 text-xs font-medium text-zinc-800"
                >
                  <span aria-hidden="true">{DAY_SHORT_LABELS[day]}</span>
                  <span className="sr-only">{DAY_LABELS[day]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleSlots.map((slot) => (
              <tr key={slot}>
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-b border-r border-zinc-200 bg-zinc-50 px-2 text-xs font-normal tabular-nums text-zinc-700"
                >
                  {slotIndexToTimeLabel(slot)}
                </th>
                {DAYS.map((day) => {
                  const count = grid[day]?.[slot] ?? 0;
                  const level = heatLevel(computeIntensity(count, members.length));
                  const isSelected = selection?.day === day && selection.slot === slot;
                  return (
                    <td key={day} className="border-b border-zinc-100 p-0">
                      <button
                        type="button"
                        onClick={() => setSelection({ day, slot })}
                        aria-pressed={isSelected}
                        aria-label={`${DAY_LABELS[day]} ${slotRangeLabel(slot, slot + 1)} ว่าง ${count} จาก ${members.length} คน`}
                        className={`h-8 w-full text-xs tabular-nums ${HEAT_LEVEL_CLASSES[level]} ${
                          isSelected ? "relative z-0 outline-2 -outline-offset-2 outline-zinc-950" : ""
                        } ${count > 0 && count === members.length ? "font-bold" : ""}`}
                      >
                        {count}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Legend />

      <div ref={detailRef}>
        {selection && detail ? (
          <section
            aria-label="รายละเอียดช่วงเวลาที่เลือก"
            className="space-y-4 rounded-xl border border-zinc-300 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium">
                {DAY_LABELS[selection.day]} {slotRangeLabel(selection.slot, selection.slot + 1)}
              </h3>
              <button
                type="button"
                onClick={() => setSelection(null)}
                className="rounded-lg border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-100"
              >
                ปิด
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium text-emerald-900">ว่าง ({detail.available.length} คน)</h4>
                {detail.available.length === 0 ? (
                  <p className="mt-1 text-sm text-zinc-600">ไม่มีใครว่างในช่วงนี้</p>
                ) : (
                  <ul className="mt-1 space-y-0.5 text-sm">
                    {detail.available.map((id) => (
                      <li key={id} className="break-words">
                        {nameOf(id)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium text-zinc-800">ไม่ว่าง ({detail.unavailable.length} คน)</h4>
                {detail.unavailable.length === 0 ? (
                  <p className="mt-1 text-sm text-zinc-600">ทุกคนว่างในช่วงนี้</p>
                ) : (
                  <ul className="mt-1 space-y-0.5 text-sm text-zinc-700">
                    {detail.unavailable.map((id) => (
                      <li key={id} className="break-words">
                        {nameOf(id)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            {canCreateEvent && (
              <CreateEventForm
                key={`${selection.day}:${selection.slot}`}
                groupId={groupId}
                dayOfWeek={selection.day}
                startSlot={selection.slot}
                defaultDate={nextDates[selection.day] ?? ""}
              />
            )}
          </section>
        ) : (
          <p className="text-sm text-zinc-600">
            {canCreateEvent
              ? "กดที่ช่องเวลาเพื่อดูรายชื่อคนที่ว่าง และสร้างนัดหมายจากช่วงเวลานั้น"
              : "กดที่ช่องเวลาเพื่อดูรายชื่อคนที่ว่างและไม่ว่าง"}
          </p>
        )}
      </div>
    </div>
  );
}

function Legend() {
  const items: { level: 0 | 1 | 2 | 3 | 4; label: string }[] = [
    { level: 0, label: "ไม่มีใครว่าง" },
    { level: 1, label: "ว่างไม่เกิน 25%" },
    { level: 2, label: "ไม่เกิน 50%" },
    { level: 3, label: "ไม่เกิน 75%" },
    { level: 4, label: "มากกว่า 75%" },
  ];
  return (
    <div className="space-y-1">
      <ul aria-label="คำอธิบายระดับสี" className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-700">
        {items.map((item) => (
          <li key={item.level} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={`inline-block size-5 rounded border border-zinc-300 text-center leading-5 ${HEAT_LEVEL_CLASSES[item.level]}`}
            >
              {item.level === 0 ? 0 : ""}
            </span>
            {item.label}
          </li>
        ))}
      </ul>
      <p className="text-xs text-zinc-600">
        ตัวเลขในช่อง = จำนวนสมาชิกที่ว่าง (ตัวหนา = ว่างครบทุกคน) สัดส่วนเทียบกับสมาชิกทั้งกลุ่ม
      </p>
    </div>
  );
}

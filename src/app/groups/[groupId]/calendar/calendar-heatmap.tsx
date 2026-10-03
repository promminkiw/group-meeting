"use client";

import { useEffect, useRef, useState } from "react";
import { Check, CheckCircle2, MinusCircle, MousePointerClick, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { cn } from "@/lib/cn";
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
      <Card padding="none" className="overflow-hidden">
        <div className="max-h-[70vh] overflow-auto">
          <table className="w-full min-w-[26rem] border-separate border-spacing-0 text-center">
            <caption className="sr-only">
              ตารางจำนวนสมาชิกที่ว่างในแต่ละช่วงเวลา ช่องละ 30 นาที กดช่องเพื่อดูรายชื่อ
            </caption>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="sticky left-0 top-0 z-30 border-b border-r border-line bg-surface-muted px-2 py-2 text-xs font-medium text-ink-muted"
                >
                  เวลา
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    scope="col"
                    className="sticky top-0 z-20 border-b border-line bg-surface-muted px-1 py-2 text-xs font-semibold text-ink"
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
                    className="sticky left-0 z-10 border-b border-r border-line bg-surface-muted px-2 text-xs font-normal tabular-nums text-ink-muted"
                  >
                    {slotIndexToTimeLabel(slot)}
                  </th>
                  {DAYS.map((day) => {
                    const count = grid[day]?.[slot] ?? 0;
                    const level = heatLevel(computeIntensity(count, members.length));
                    const isSelected = selection?.day === day && selection.slot === slot;
                    const isEveryone = count > 0 && count === members.length;
                    return (
                      <td key={day} className="border-b border-r border-white p-0">
                        <button
                          type="button"
                          onClick={() => setSelection({ day, slot })}
                          aria-pressed={isSelected}
                          aria-label={`${DAY_LABELS[day]} ${slotRangeLabel(slot, slot + 1)} ว่าง ${count} จาก ${members.length} คน`}
                          className={cn(
                            "flex h-9 w-full items-center justify-center gap-0.5 text-xs tabular-nums transition-colors hover:brightness-95 focus-visible:-outline-offset-2 motion-reduce:transition-none md:h-8",
                            HEAT_LEVEL_CLASSES[level],
                            isEveryone && "font-bold",
                            isSelected &&
                              "relative z-0 outline-2 -outline-offset-2 outline-ink ring-4 ring-inset ring-white",
                          )}
                        >
                          {isEveryone && <Check className="size-2.5" aria-hidden="true" />}
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
      </Card>

      <Legend />

      <div ref={detailRef}>
        {selection && detail ? (
          <Card as="section" aria-label="รายละเอียดช่วงเวลาที่เลือก" className="space-y-4 border-primary-200">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-semibold leading-[1.5]">
                {DAY_LABELS[selection.day]} {slotRangeLabel(selection.slot, selection.slot + 1)}
              </h3>
              <Button variant="ghost" size="sm" icon={X} onClick={() => setSelection(null)}>
                ปิด
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h4 className="flex items-center gap-1.5 text-sm font-semibold text-done-fg">
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  ว่าง ({detail.available.length} คน)
                </h4>
                {detail.available.length === 0 ? (
                  <p className="mt-2 text-sm text-ink-muted">ไม่มีใครว่างในช่วงนี้</p>
                ) : (
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {detail.available.map((id) => (
                      <MemberRow key={id} name={nameOf(id)} />
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h4 className="flex items-center gap-1.5 text-sm font-semibold text-ink-muted">
                  <MinusCircle className="size-4 text-ink-subtle" aria-hidden="true" />
                  ไม่ว่าง ({detail.unavailable.length} คน)
                </h4>
                {detail.unavailable.length === 0 ? (
                  <p className="mt-2 text-sm text-ink-muted">ทุกคนว่างในช่วงนี้</p>
                ) : (
                  <ul className="mt-2 space-y-1.5 text-sm text-ink-muted">
                    {detail.unavailable.map((id) => (
                      <MemberRow key={id} name={nameOf(id)} />
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
          </Card>
        ) : (
          <p className="flex items-center gap-2 text-sm text-ink-muted">
            <MousePointerClick className="size-4 shrink-0" aria-hidden="true" />
            {canCreateEvent
              ? "กดที่ช่องเวลาเพื่อดูรายชื่อคนที่ว่าง และสร้างนัดหมายจากช่วงเวลานั้น"
              : "กดที่ช่องเวลาเพื่อดูรายชื่อคนที่ว่างและไม่ว่าง"}
          </p>
        )}
      </div>
    </div>
  );
}

function MemberRow({ name }: { name: string }) {
  return (
    <li className="flex items-center gap-2">
      <Avatar name={name} size="sm" />
      <span className="min-w-0 break-words">{name}</span>
    </li>
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
    <div className="space-y-1.5">
      <ul aria-label="คำอธิบายระดับสี" className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-muted">
        {items.map((item) => (
          <li key={item.level} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={cn(
                "inline-block size-5 rounded border border-line text-center leading-5",
                HEAT_LEVEL_CLASSES[item.level],
              )}
            >
              {item.level === 0 ? 0 : ""}
            </span>
            {item.label}
          </li>
        ))}
      </ul>
      <p className="text-xs text-ink-muted">
        ตัวเลขในช่อง = จำนวนสมาชิกที่ว่าง (ตัวหนาพร้อมเครื่องหมายถูก = ว่างครบทุกคน) สัดส่วนเทียบกับสมาชิกทั้งกลุ่ม
      </p>
    </div>
  );
}

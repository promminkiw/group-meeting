"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { PendingButton } from "@/components/pending-button";
import { DAY_LABELS, DAY_SHORT_LABELS } from "@/lib/availability/display";
import { DAYS_PER_WEEK, SLOTS_PER_DAY, slotIndexToTimeLabel } from "@/lib/availability/heatmap";
import { toSlotKey } from "@/lib/availability/slots";
import { saveAvailability, type AvailabilityActionState } from "./actions";

const initialState: AvailabilityActionState = {};
const DAYS = Array.from({ length: DAYS_PER_WEEK }, (_, day) => day);
const SLOTS = Array.from({ length: SLOTS_PER_DAY }, (_, slot) => slot);

type DragMode = "add" | "remove";

function sameSet(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  return a.size === b.size && [...a].every((key) => b.has(key));
}

export function AvailabilityGrid({ groupId, initialKeys }: { groupId: string; initialKeys: string[] }) {
  const [state, formAction] = useActionState(saveAvailability, initialState);
  const [selected, setSelected] = useState<Set<string>>(() => new Set(initialKeys));
  const dragModeRef = useRef<DragMode | null>(null);
  // เมาส์จัดการที่ pointerdown แล้ว จึงต้องข้าม click ที่ตามมา (คีย์บอร์ด/ทัชยังใช้ click)
  const skipClickRef = useRef(false);

  const dirty = !sameSet(selected, new Set(initialKeys));

  useEffect(() => {
    function endDrag() {
      dragModeRef.current = null;
      // ล้างค่าหลัง click กันค้างเมื่อปล่อยเมาส์นอกปุ่มจน click ไม่เกิด
      setTimeout(() => {
        skipClickRef.current = false;
      }, 50);
    }
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    return () => {
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
  }, []);

  function applyKey(key: string, mode: DragMode) {
    setSelected((current) => {
      if (mode === "add" ? current.has(key) : !current.has(key)) return current;
      const next = new Set(current);
      if (mode === "add") next.add(key);
      else next.delete(key);
      return next;
    });
  }

  function toggleKey(key: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function setDay(day: number, on: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      for (const slot of SLOTS) {
        if (on) next.add(toSlotKey(day, slot));
        else next.delete(toSlotKey(day, slot));
      }
      return next;
    });
  }

  function keyFromTarget(target: EventTarget | null): string | null {
    if (!(target instanceof Element)) return null;
    return target.closest<HTMLElement>("[data-slot-key]")?.dataset.slotKey ?? null;
  }

  // ลากเฉพาะเมาส์/ปากกา; ทัชไม่ลากเพื่อไม่ขวางการเลื่อนหน้าจอ
  function handlePointerDown(event: React.PointerEvent<HTMLTableElement>) {
    if (event.pointerType === "touch" || event.button !== 0) return;
    const key = keyFromTarget(event.target);
    if (!key) return;
    const mode: DragMode = selected.has(key) ? "remove" : "add";
    dragModeRef.current = mode;
    skipClickRef.current = true;
    applyKey(key, mode);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLTableElement>) {
    const mode = dragModeRef.current;
    if (!mode) return;
    const key = keyFromTarget(event.target);
    if (key) applyKey(key, mode);
  }

  function handleClick(event: React.MouseEvent<HTMLTableElement>) {
    if (skipClickRef.current) {
      skipClickRef.current = false;
      return;
    }
    const key = keyFromTarget(event.target);
    if (key) toggleKey(key);
  }

  const orderedKeys = [...selected].sort();

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="groupId" value={groupId} />
      {orderedKeys.map((key) => (
        <input key={key} type="hidden" name="slots" value={key} />
      ))}

      <div className="max-h-[70vh] overflow-auto rounded-xl border border-zinc-200 bg-white">
        <table
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onClick={handleClick}
          className="w-full min-w-[26rem] select-none border-separate border-spacing-0 text-center"
        >
          <caption className="sr-only">ตารางเลือกเวลาว่างรายสัปดาห์ ช่องละ 30 นาที</caption>
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 top-0 z-30 border-b border-r border-zinc-200 bg-zinc-50 px-2 py-2 text-xs font-medium text-zinc-700">
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
                  <div className="mt-1 flex flex-col items-stretch gap-1">
                    <button
                      type="button"
                      onClick={() => setDay(day, true)}
                      aria-label={`เลือกทั้งวัน${DAY_LABELS[day]}`}
                      className="rounded border border-zinc-300 bg-white px-1 py-0.5 text-[11px] font-normal hover:bg-zinc-100"
                    >
                      ทั้งวัน
                    </button>
                    <button
                      type="button"
                      onClick={() => setDay(day, false)}
                      aria-label={`ล้างวัน${DAY_LABELS[day]}`}
                      className="rounded border border-zinc-300 bg-white px-1 py-0.5 text-[11px] font-normal hover:bg-zinc-100"
                    >
                      ล้าง
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SLOTS.map((slot) => (
              <tr key={slot}>
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-b border-r border-zinc-200 bg-zinc-50 px-2 text-xs font-normal tabular-nums text-zinc-700"
                >
                  {slotIndexToTimeLabel(slot)}
                </th>
                {DAYS.map((day) => {
                  const key = toSlotKey(day, slot);
                  const isOn = selected.has(key);
                  return (
                    <td key={day} className="border-b border-zinc-100 p-0">
                      <button
                        type="button"
                        data-slot-key={key}
                        aria-pressed={isOn}
                        aria-label={`${DAY_LABELS[day]} ${slotIndexToTimeLabel(slot)}`}
                        className={`h-8 w-full text-[11px] ${
                          isOn
                            ? "bg-emerald-700 font-medium text-white"
                            : "bg-white text-transparent hover:bg-zinc-100"
                        }`}
                      >
                        {isOn ? "ว่าง" : "-"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-zinc-600">
        เลือกแล้ว {selected.size} ช่อง ({selected.size / 2} ชั่วโมงต่อสัปดาห์)
        {dirty && " - มีการเปลี่ยนแปลงที่ยังไม่บันทึก"}
      </p>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.success && !dirty && (
        <p role="status" className="text-sm text-emerald-800">
          บันทึกเวลาว่างเรียบร้อยแล้ว
        </p>
      )}
      <div className="sticky bottom-0 -mx-4 border-t border-zinc-200 bg-white/95 px-4 py-3 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <PendingButton label="บันทึก" pendingLabel="กำลังบันทึก..." className="w-full sm:w-auto" />
      </div>
    </form>
  );
}

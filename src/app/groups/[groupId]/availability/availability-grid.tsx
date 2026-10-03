"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { PendingButton } from "@/components/pending-button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { DAY_LABELS, DAY_SHORT_LABELS } from "@/lib/availability/display";
import { DAYS_PER_WEEK, SLOTS_PER_DAY, slotIndexToTimeLabel } from "@/lib/availability/heatmap";
import { toSlotKey } from "@/lib/availability/slots";
import { saveAvailability, type AvailabilityActionState } from "./actions";

const initialState: AvailabilityActionState = {};
const DAYS = Array.from({ length: DAYS_PER_WEEK }, (_, day) => day);
const SLOTS = Array.from({ length: SLOTS_PER_DAY }, (_, slot) => slot);

const DAY_ACTION_CLASSES =
  "min-h-7 rounded py-1 text-[11px] font-medium text-primary-700 hover:underline";

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

      <Card padding="none" className="overflow-hidden">
        <div className="max-h-[70vh] overflow-auto">
          <table
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onClick={handleClick}
            className="w-full min-w-[26rem] select-none border-separate border-spacing-0 text-center"
          >
            <caption className="sr-only">ตารางเลือกเวลาว่างรายสัปดาห์ ช่องละ 30 นาที</caption>
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
                    <div className="mt-1 flex flex-col items-stretch">
                      <button
                        type="button"
                        onClick={() => setDay(day, true)}
                        aria-label={`เลือกทั้งวัน${DAY_LABELS[day]}`}
                        className={DAY_ACTION_CLASSES}
                      >
                        ทั้งวัน
                      </button>
                      <button
                        type="button"
                        onClick={() => setDay(day, false)}
                        aria-label={`ล้างวัน${DAY_LABELS[day]}`}
                        className={DAY_ACTION_CLASSES}
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
                    className="sticky left-0 z-10 border-b border-r border-line bg-surface-muted px-2 text-xs font-normal tabular-nums text-ink-muted"
                  >
                    {slotIndexToTimeLabel(slot)}
                  </th>
                  {DAYS.map((day) => {
                    const key = toSlotKey(day, slot);
                    const isOn = selected.has(key);
                    return (
                      <td key={day} className="border-b border-r border-white p-0">
                        <button
                          type="button"
                          data-slot-key={key}
                          aria-pressed={isOn}
                          aria-label={`${DAY_LABELS[day]} ${slotIndexToTimeLabel(slot)}`}
                          className={cn(
                            "flex h-9 w-full items-center justify-center text-xs transition-colors focus-visible:-outline-offset-2 motion-reduce:transition-none md:h-8",
                            isOn
                              ? "bg-primary-600 font-medium text-white hover:bg-primary-700"
                              : "bg-surface text-transparent hover:bg-primary-100",
                          )}
                        >
                          {isOn ? (
                            <>
                              <Check className="size-3" aria-hidden="true" />
                              <span className="sr-only">ว่าง</span>
                            </>
                          ) : (
                            "-"
                          )}
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

      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
        <span className="tabular-nums">
          เลือกแล้ว {selected.size} ช่อง ({selected.size / 2} ชั่วโมงต่อสัปดาห์)
        </span>
        {dirty && <Badge tone="warning">มีการเปลี่ยนแปลงที่ยังไม่บันทึก</Badge>}
      </p>

      <Alert tone="error">{state.error}</Alert>
      {state.success && !dirty && <Alert tone="success">บันทึกเวลาว่างเรียบร้อยแล้ว</Alert>}

      <div className="sticky bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 -mx-4 border-t border-line bg-surface/95 px-4 py-3 md:static md:mx-0 md:border-0 md:bg-transparent md:p-0">
        <PendingButton label="บันทึก" pendingLabel="กำลังบันทึก..." className="w-full md:w-auto" />
      </div>
    </form>
  );
}

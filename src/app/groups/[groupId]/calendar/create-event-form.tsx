"use client";

import { useActionState } from "react";
import { PendingButton } from "@/components/pending-button";
import { durationLabel, DAY_LABELS, slotRangeLabel } from "@/lib/availability/display";
import { SLOTS_PER_DAY } from "@/lib/availability/heatmap";
import { EVENT_DESCRIPTION_MAX_LENGTH, EVENT_TITLE_MAX_LENGTH } from "@/lib/availability/events";
import { createEvent, type EventActionState } from "./actions";

const initialState: EventActionState = {};
// จำกัดตัวเลือกในรายการให้สั้น (server ยอมรับได้ถึงสิ้นวัน)
const DURATION_OPTION_LIMIT = 16;

type Props = {
  groupId: string;
  dayOfWeek: number;
  startSlot: number;
  defaultDate: string;
};

export function CreateEventForm({ groupId, dayOfWeek, startSlot, defaultDate }: Props) {
  const [state, formAction] = useActionState(createEvent, initialState);
  const maxCount = Math.min(SLOTS_PER_DAY - startSlot, DURATION_OPTION_LIMIT);
  const counts = Array.from({ length: maxCount }, (_, index) => index + 1);

  return (
    <form action={formAction} className="space-y-3 border-t border-zinc-200 pt-4">
      <h4 className="text-sm font-semibold">
        สร้างนัดหมาย ({DAY_LABELS[dayOfWeek]} เริ่ม {slotRangeLabel(startSlot, startSlot + 1).slice(0, 5)})
      </h4>
      <input type="hidden" name="groupId" value={groupId} />
      <input type="hidden" name="dayOfWeek" value={dayOfWeek} />
      <input type="hidden" name="startSlot" value={startSlot} />
      <div>
        <label htmlFor="event-title" className="block text-sm font-medium text-zinc-700">
          ชื่อนัดหมาย
        </label>
        <input
          id="event-title"
          name="title"
          type="text"
          required
          maxLength={EVENT_TITLE_MAX_LENGTH}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-base"
        />
      </div>
      <div>
        <label htmlFor="event-description" className="block text-sm font-medium text-zinc-700">
          รายละเอียด (ไม่บังคับ)
        </label>
        <textarea
          id="event-description"
          name="description"
          rows={3}
          maxLength={EVENT_DESCRIPTION_MAX_LENGTH}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-base"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="event-date" className="block text-sm font-medium text-zinc-700">
            วันที่ (ต้องเป็นวัน{DAY_LABELS[dayOfWeek]})
          </label>
          <input
            id="event-date"
            name="date"
            type="date"
            required
            defaultValue={defaultDate}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-base"
          />
        </div>
        <div>
          <label htmlFor="event-count" className="block text-sm font-medium text-zinc-700">
            ระยะเวลา
          </label>
          <select
            id="event-count"
            name="slotCount"
            defaultValue="2"
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base"
          >
            {counts.map((count) => (
              <option key={count} value={count}>
                {durationLabel(count)}
              </option>
            ))}
          </select>
        </div>
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-emerald-800">
          สร้างนัดหมายเรียบร้อยแล้ว
        </p>
      )}
      <PendingButton label="สร้างนัดหมาย" pendingLabel="กำลังสร้าง..." className="w-full sm:w-auto" />
    </form>
  );
}

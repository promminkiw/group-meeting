"use client";

import { useActionState } from "react";
import { CalendarPlus } from "lucide-react";
import { PendingButton } from "@/components/pending-button";
import { Alert } from "@/components/ui/alert";
import { Input, Select, Textarea } from "@/components/ui/field";
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
    <form action={formAction} className="space-y-3 border-t border-line pt-4">
      <h4 className="text-sm font-semibold">
        สร้างนัดหมาย ({DAY_LABELS[dayOfWeek]} เริ่ม {slotRangeLabel(startSlot, startSlot + 1).slice(0, 5)})
      </h4>
      <input type="hidden" name="groupId" value={groupId} />
      <input type="hidden" name="dayOfWeek" value={dayOfWeek} />
      <input type="hidden" name="startSlot" value={startSlot} />
      <Input
        id="event-title"
        name="title"
        type="text"
        label="ชื่อนัดหมาย"
        required
        maxLength={EVENT_TITLE_MAX_LENGTH}
      />
      <Textarea
        id="event-description"
        name="description"
        label="รายละเอียด (ไม่บังคับ)"
        rows={3}
        maxLength={EVENT_DESCRIPTION_MAX_LENGTH}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          id="event-date"
          name="date"
          type="date"
          label={`วันที่ (ต้องเป็นวัน${DAY_LABELS[dayOfWeek]})`}
          required
          defaultValue={defaultDate}
        />
        <Select id="event-count" name="slotCount" label="ระยะเวลา" defaultValue="2">
          {counts.map((count) => (
            <option key={count} value={count}>
              {durationLabel(count)}
            </option>
          ))}
        </Select>
      </div>
      <Alert tone="error">{state.error}</Alert>
      {state.success && <Alert tone="success">สร้างนัดหมายเรียบร้อยแล้ว</Alert>}
      <PendingButton
        label="สร้างนัดหมาย"
        pendingLabel="กำลังสร้าง..."
        icon={CalendarPlus}
        className="w-full sm:w-auto"
      />
    </form>
  );
}

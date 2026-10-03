"use client";

import { useActionState } from "react";
import { PendingButton } from "@/components/pending-button";
import { deleteEvent, type EventActionState } from "./actions";

const initialState: EventActionState = {};

export function DeleteEventForm({ groupId, eventId }: { groupId: string; eventId: string }) {
  const [state, formAction] = useActionState(deleteEvent, initialState);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm("ลบนัดหมายนี้ใช่หรือไม่? การลบไม่สามารถย้อนกลับได้")) event.preventDefault();
      }}
      className="space-y-1"
    >
      <input type="hidden" name="groupId" value={groupId} />
      <input type="hidden" name="eventId" value={eventId} />
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <PendingButton label="ลบ" pendingLabel="กำลังลบ..." variant="danger" className="px-3 py-1" />
    </form>
  );
}

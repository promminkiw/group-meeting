"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { PendingButton } from "@/components/pending-button";
import { Alert } from "@/components/ui/alert";
import { deleteEvent, type EventActionState } from "./actions";

const initialState: EventActionState = {};

type Props = { groupId: string; eventId: string; title: string };

export function DeleteEventForm({ groupId, eventId, title }: Props) {
  const [state, formAction] = useActionState(deleteEvent, initialState);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm("ลบนัดหมายนี้ใช่หรือไม่? การลบไม่สามารถย้อนกลับได้")) event.preventDefault();
      }}
      className="space-y-2"
    >
      <input type="hidden" name="groupId" value={groupId} />
      <input type="hidden" name="eventId" value={eventId} />
      <Alert tone="error">{state.error}</Alert>
      <PendingButton
        label="ลบนัดหมาย"
        pendingLabel="กำลังลบ..."
        variant="danger"
        size="sm"
        icon={Trash2}
        ariaLabel={`ลบนัดหมาย: ${title}`}
      />
    </form>
  );
}

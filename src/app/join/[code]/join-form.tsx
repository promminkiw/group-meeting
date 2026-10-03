"use client";

import { useActionState } from "react";
import { PendingButton } from "@/components/pending-button";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { confirmJoin, type JoinState } from "./actions";

const initialState: JoinState = {};

export function JoinForm({ code }: { code: string }) {
  const [state, formAction] = useActionState(confirmJoin, initialState);

  return (
    <form action={formAction} className="space-y-3 text-left">
      <input type="hidden" name="code" value={code} />
      <Alert tone="error">{state.error}</Alert>
      <PendingButton label="เข้าร่วมกลุ่ม" pendingLabel="กำลังเข้ากลุ่ม..." size="lg" fullWidth />
      <Button href="/" variant="ghost" size="lg" fullWidth>
        ยกเลิก
      </Button>
    </form>
  );
}

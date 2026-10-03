"use client";

import { useActionState } from "react";
import { Link2 } from "lucide-react";
import { PendingButton } from "@/components/pending-button";
import { Alert } from "@/components/ui/alert";
import { Input, Select } from "@/components/ui/field";
import { createInvite, type MemberActionState } from "./actions";

const initialState: MemberActionState = {};

export function InviteForm({ groupId }: { groupId: string }) {
  const [state, formAction] = useActionState(createInvite, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="groupId" value={groupId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="invite-max-uses"
          name="maxUses"
          type="number"
          label="ใช้ได้สูงสุดกี่ครั้ง (เว้นว่าง = ไม่จำกัด)"
          min={1}
          max={1000}
          step={1}
          inputMode="numeric"
          defaultValue={state.values?.maxUses}
        />
        <Select
          id="invite-expires"
          name="expiresInDays"
          label="หมดอายุ"
          defaultValue={state.values?.expiresInDays ?? "7"}
        >
          <option value="1">ใน 1 วัน</option>
          <option value="7">ใน 7 วัน</option>
          <option value="30">ใน 30 วัน</option>
          <option value="never">ไม่หมดอายุ</option>
        </Select>
      </div>
      <Alert tone="error">{state.error}</Alert>
      <PendingButton
        label="สร้างลิงก์เชิญ"
        pendingLabel="กำลังสร้าง..."
        icon={Link2}
        className="max-sm:w-full"
      />
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { ShieldCheck, ShieldOff, UserMinus } from "lucide-react";
import { PendingButton } from "@/components/pending-button";
import { Alert } from "@/components/ui/alert";
import { ROLE_LABELS } from "@/lib/groups/labels";
import type { MemberRole } from "@/types/database";
import { changeMemberRole, removeMember, type MemberActionState } from "./actions";

const initialState: MemberActionState = {};

type Props = {
  groupId: string;
  userId: string;
  displayName: string;
  role: MemberRole;
  isSelf: boolean;
};

export function MemberActions({ groupId, userId, displayName, role, isSelf }: Props) {
  const [roleState, roleAction] = useActionState(changeMemberRole, initialState);
  const [removeState, removeAction] = useActionState(removeMember, initialState);
  const nextRole: MemberRole = role === "admin" ? "member" : "admin";
  const error = roleState.error ?? removeState.error;

  return (
    <div className="flex flex-col gap-2 md:items-end">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <form action={roleAction} className="max-sm:contents">
          <input type="hidden" name="groupId" value={groupId} />
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="role" value={nextRole} />
          <PendingButton
            label={nextRole === "admin" ? "ตั้งเป็นผู้ดูแล" : `เปลี่ยนเป็น${ROLE_LABELS.member}`}
            pendingLabel="กำลังบันทึก..."
            variant="secondary"
            size="sm"
            icon={nextRole === "admin" ? ShieldCheck : ShieldOff}
            className="max-sm:w-full"
          />
        </form>
        {!isSelf && (
          <form
            action={removeAction}
            className="max-sm:contents"
            onSubmit={(event) => {
              if (!window.confirm(`ลบ ${displayName} ออกจากกลุ่ม?`)) event.preventDefault();
            }}
          >
            <input type="hidden" name="groupId" value={groupId} />
            <input type="hidden" name="userId" value={userId} />
            <PendingButton
              label="ลบออกจากกลุ่ม"
              pendingLabel="กำลังลบ..."
              variant="danger"
              size="sm"
              icon={UserMinus}
              className="max-sm:w-full"
            />
          </form>
        )}
      </div>
      <Alert tone="error">{error}</Alert>
    </div>
  );
}

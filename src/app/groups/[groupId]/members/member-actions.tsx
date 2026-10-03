"use client";

import { useActionState } from "react";
import { PendingButton } from "@/components/pending-button";
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
    <div className="flex flex-col gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2">
        <form action={roleAction}>
          <input type="hidden" name="groupId" value={groupId} />
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="role" value={nextRole} />
          <PendingButton
            label={nextRole === "admin" ? "ตั้งเป็นผู้ดูแล" : `เปลี่ยนเป็น${ROLE_LABELS.member}`}
            pendingLabel="กำลังบันทึก..."
            variant="secondary"
          />
        </form>
        {!isSelf && (
          <form
            action={removeAction}
            onSubmit={(event) => {
              if (!window.confirm(`ลบ ${displayName} ออกจากกลุ่ม?`)) event.preventDefault();
            }}
          >
            <input type="hidden" name="groupId" value={groupId} />
            <input type="hidden" name="userId" value={userId} />
            <PendingButton label="ลบออกจากกลุ่ม" pendingLabel="กำลังลบ..." variant="danger" />
          </form>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600 sm:text-right">
          {error}
        </p>
      )}
    </div>
  );
}

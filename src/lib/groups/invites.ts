import type { InviteRow } from "@/types/database";

export type InviteStatus = {
  active: boolean;
  statusLabel: string;
  summary: string;
};

const dateFormatter = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Bangkok",
});

export function describeInvite(invite: InviteRow, nowMs: number = Date.now()): InviteStatus {
  const expired = invite.expires_at !== null && new Date(invite.expires_at).getTime() <= nowMs;
  const exhausted = invite.max_uses !== null && invite.use_count >= invite.max_uses;

  let statusLabel = "ใช้งานได้";
  if (invite.revoked_at) statusLabel = "ยกเลิกแล้ว";
  else if (expired) statusLabel = "หมดอายุ";
  else if (exhausted) statusLabel = "ใช้ครบแล้ว";

  const usage =
    invite.max_uses === null
      ? `ใช้แล้ว ${invite.use_count} ครั้ง`
      : `ใช้แล้ว ${invite.use_count}/${invite.max_uses} ครั้ง`;
  const expiry = invite.expires_at
    ? `หมดอายุ ${dateFormatter.format(new Date(invite.expires_at))}`
    : "ไม่หมดอายุ";

  return {
    active: statusLabel === "ใช้งานได้",
    statusLabel,
    summary: `${usage} · ${expiry}`,
  };
}

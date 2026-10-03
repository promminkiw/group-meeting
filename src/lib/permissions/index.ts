import type { MemberRole } from "@/types/database";

export type Action =
  | "viewGroup"
  | "viewTasks"
  | "createTask"
  | "assignTask"
  | "updateOwnTaskStatus"
  | "inviteMember"
  | "manageMembers"
  | "createEvent"
  | "fillAvailability"
  | "deleteGroup"
  | "leaveGroup";

export type GroupRole = MemberRole | null;

const MEMBER_ACTIONS: readonly Action[] = [
  "viewGroup",
  "viewTasks",
  "updateOwnTaskStatus",
  "fillAvailability",
  "leaveGroup",
];

const ADMIN_ONLY_ACTIONS: readonly Action[] = [
  "createTask",
  "assignTask",
  "inviteMember",
  "manageMembers",
  "createEvent",
  "deleteGroup",
];

// ตรงกับ RLS: admin จัดการข้อมูลกลุ่ม ส่วนสมาชิกอ่านและแก้สถานะงานของตัวเอง ใช้ซ่อน/แสดง UI เท่านั้น (RLS คือด่านจริง)
const PERMISSIONS: Record<MemberRole, ReadonlySet<Action>> = {
  admin: new Set<Action>([...MEMBER_ACTIONS, ...ADMIN_ONLY_ACTIONS]),
  member: new Set<Action>(MEMBER_ACTIONS),
};

export function can(role: GroupRole, action: Action): boolean {
  if (role === null) return false;
  return PERMISSIONS[role].has(action);
}

type MemberLike = { userId: string; role: MemberRole };

// ตรงกับ trigger "a group must keep at least one admin": ผู้ใช้เป็น admin และไม่มี admin คนอื่นเหลือ
export function isLastAdmin(members: readonly MemberLike[], userId: string): boolean {
  const me = members.find((member) => member.userId === userId);
  if (!me || me.role !== "admin") return false;
  return !members.some((member) => member.userId !== userId && member.role === "admin");
}

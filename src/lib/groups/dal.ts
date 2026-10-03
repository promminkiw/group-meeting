import { cache } from "react";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/auth/dal";
import { can } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";
import type {
  GroupMember,
  GroupRow,
  GroupWithRole,
  InviteRow,
  MemberRole,
} from "@/types/database";
import { isUuid } from "./validation";

type GroupSummary = Pick<GroupRow, "id" | "name" | "description" | "created_at">;

type MyGroupRow = {
  role: MemberRole;
  groups: (GroupSummary & { memberships: { count: number }[] }) | null;
};

type MemberQueryRow = {
  user_id: string;
  role: MemberRole;
  joined_at: string;
  profiles: { display_name: string } | null;
};

type MyRoleRow = { role: MemberRole; groups: GroupSummary | null };

export type GroupContext = {
  userId: string;
  role: MemberRole;
  group: GroupSummary;
};

export const getMyGroups = cache(async (): Promise<GroupWithRole[]> => {
  const user = await verifySession();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memberships")
    .select("role, groups(id, name, description, created_at, memberships(count))")
    .eq("user_id", user.id);

  if (error) throw new Error(`Failed to load groups: ${error.message}`);

  const rows = (data ?? []) as unknown as MyGroupRow[];
  return rows
    .flatMap((row): GroupWithRole[] =>
      row.groups
        ? [
            {
              id: row.groups.id,
              name: row.groups.name,
              description: row.groups.description,
              created_at: row.groups.created_at,
              role: row.role,
              memberCount: row.groups.memberships[0]?.count ?? 0,
            },
          ]
        : [],
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
});

// คืน null ถ้าไม่ใช่สมาชิก (RLS ซ่อนกลุ่มที่ไม่เกี่ยวข้อง)
export const loadGroupContext = cache(async (groupId: string): Promise<GroupContext | null> => {
  if (!isUuid(groupId)) return null;

  const user = await verifySession();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memberships")
    .select("role, groups(id, name, description, created_at)")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load group: ${error.message}`);

  const row = data as unknown as MyRoleRow | null;
  if (!row || !row.groups) return null;
  return { userId: user.id, role: row.role, group: row.groups };
});

export async function getGroupContext(groupId: string): Promise<GroupContext> {
  const context = await loadGroupContext(groupId);
  if (!context || !can(context.role, "viewGroup")) notFound();
  return context;
}

export type AdminCheck = { ok: true; userId: string } | { ok: false; error: string };

// ใช้ใน Server Action: คืนผลแทนการ throw เพื่อให้ action ส่งข้อความไทยกลับฟอร์มได้
export async function requireGroupAdmin(groupId: string): Promise<AdminCheck> {
  const context = await loadGroupContext(groupId);
  if (!context) return { ok: false, error: "ไม่พบกลุ่มนี้หรือคุณไม่ได้เป็นสมาชิก" };
  if (!can(context.role, "manageMembers")) {
    return { ok: false, error: "เฉพาะผู้ดูแลกลุ่มเท่านั้นที่ทำรายการนี้ได้" };
  }
  return { ok: true, userId: context.userId };
}

// ต้องเรียกหลังตรวจสิทธิ์สมาชิกแล้ว (ฟังก์ชันนี้ไม่ตรวจ role เอง)
export const getGroupMembers = cache(async (groupId: string): Promise<GroupMember[]> => {
  if (!isUuid(groupId)) return [];
  await verifySession();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memberships")
    .select("user_id, role, joined_at, profiles(display_name)")
    .eq("group_id", groupId)
    .order("joined_at", { ascending: true });

  if (error) throw new Error(`Failed to load members: ${error.message}`);

  const rows = (data ?? []) as unknown as MemberQueryRow[];
  return rows.map((row) => ({
    userId: row.user_id,
    role: row.role,
    joinedAt: row.joined_at,
    displayName: row.profiles?.display_name ?? "ไม่ทราบชื่อ",
  }));
});

// ต้องเรียกหลังตรวจสิทธิ์ admin แล้ว; RLS อนุญาตเฉพาะ admin ของกลุ่มให้เห็น invite
export const getGroupInvites = cache(async (groupId: string): Promise<InviteRow[]> => {
  if (!isUuid(groupId)) return [];
  await verifySession();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invites")
    .select("id, group_id, code, created_by, expires_at, max_uses, use_count, revoked_at, created_at")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load invites: ${error.message}`);
  return (data ?? []) as unknown as InviteRow[];
});

// Type เขียนมือให้ตรงกับ supabase/migrations (ไม่ผูกกับ generic ของ client)

export type MemberRole = "admin" | "member";
export type TaskStatus = "todo" | "doing" | "done";

export type ProfileRow = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
};

export type GroupRow = {
  id: string;
  name: string;
  description: string | null;
  // null เมื่อบัญชีผู้สร้างถูกลบ (migration 000006)
  created_by: string | null;
  created_at: string;
};

export type MembershipRow = {
  group_id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
};

export type InviteRow = {
  id: string;
  group_id: string;
  code: string;
  created_by: string | null;
  expires_at: string | null;
  max_uses: number | null;
  use_count: number;
  revoked_at: string | null;
  created_at: string;
};

export type TaskRow = {
  id: string;
  group_id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskAssigneeRow = {
  task_id: string;
  user_id: string;
  status: TaskStatus;
  assigned_at: string;
  updated_at: string;
};

export type AvailabilitySlotRow = {
  user_id: string;
  day_of_week: number;
  slot_index: number;
};

export type EventRow = {
  id: string;
  group_id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  created_by: string | null;
  created_at: string;
};

// ผลลัพธ์ที่ใช้ร่วมกันในหน้า UI
export type GroupWithRole = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  role: MemberRole;
  memberCount: number;
};

export type GroupMember = {
  userId: string;
  displayName: string;
  role: MemberRole;
  joinedAt: string;
};

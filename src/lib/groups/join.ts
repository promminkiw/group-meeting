import { createClient } from "@/lib/supabase/server";
import { isInviteCode } from "./validation";

export type JoinResult = { groupId: string } | { error: string };

const INVALID_INVITE_MESSAGE = "โค้ดเชิญไม่ถูกต้อง หมดอายุ ถูกยกเลิก หรือถูกใช้ครบแล้ว";

// ใช้ร่วมกันระหว่างฟอร์มหน้าแรกและหน้ายืนยัน /join/[code]
export async function joinGroupWithCode(code: string): Promise<JoinResult> {
  if (!isInviteCode(code)) return { error: INVALID_INVITE_MESSAGE };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("join_group", { p_code: code });

  if (error) {
    if (error.message.includes("invalid or expired invite")) {
      return { error: INVALID_INVITE_MESSAGE };
    }
    console.error("join_group failed:", error.code);
    return { error: "เข้ากลุ่มไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" };
  }
  if (typeof data !== "string") return { error: "เข้ากลุ่มไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" };
  return { groupId: data };
}

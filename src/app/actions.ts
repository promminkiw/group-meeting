"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth/dal";
import { joinGroupWithCode } from "@/lib/groups/join";
import {
  GROUP_DESCRIPTION_MAX_LENGTH,
  GROUP_NAME_MAX_LENGTH,
  extractInviteCode,
  readText,
} from "@/lib/groups/validation";
import { createClient } from "@/lib/supabase/server";

export type FormState = {
  error?: string;
  // ส่งค่าที่กรอกกลับ เพราะ React ล้างฟอร์มหลัง action จบ
  values?: { name?: string; description?: string; code?: string };
};

export async function createGroup(_prev: FormState, formData: FormData): Promise<FormState> {
  await verifySession();
  const name = readText(formData, "name").trim();
  const description = readText(formData, "description").trim();

  const values = { name, description };

  if (name.length < 1 || name.length > GROUP_NAME_MAX_LENGTH) {
    return { error: `ชื่อกลุ่มต้องมี 1-${GROUP_NAME_MAX_LENGTH} ตัวอักษร`, values };
  }
  if (description.length > GROUP_DESCRIPTION_MAX_LENGTH) {
    return { error: `คำอธิบายต้องไม่เกิน ${GROUP_DESCRIPTION_MAX_LENGTH} ตัวอักษร`, values };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_group", {
    p_name: name,
    p_description: description === "" ? null : description,
  });
  if (error || typeof data !== "string") {
    console.error("create_group failed:", error?.code);
    return { error: "สร้างกลุ่มไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", values };
  }

  revalidatePath("/");
  redirect(`/groups/${data}`);
}

export async function joinGroupFromCode(_prev: FormState, formData: FormData): Promise<FormState> {
  await verifySession();
  const rawCode = readText(formData, "code");
  const values = { code: rawCode };
  const code = extractInviteCode(rawCode);
  if (code === "") return { error: "กรุณากรอกโค้ดเชิญ", values };

  const result = await joinGroupWithCode(code);
  if ("error" in result) return { error: result.error, values };

  revalidatePath("/");
  redirect(`/groups/${result.groupId}`);
}

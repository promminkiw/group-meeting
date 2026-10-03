"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth/dal";
import { joinGroupWithCode } from "@/lib/groups/join";
import { readText } from "@/lib/groups/validation";

export type JoinState = { error?: string };

export async function confirmJoin(_prev: JoinState, formData: FormData): Promise<JoinState> {
  await verifySession();
  const result = await joinGroupWithCode(readText(formData, "code"));
  if ("error" in result) return { error: result.error };

  revalidatePath("/");
  redirect(`/groups/${result.groupId}`);
}

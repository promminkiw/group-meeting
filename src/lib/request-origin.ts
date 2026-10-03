import { headers } from "next/headers";
import { resolveOrigin } from "./origin";

// origin ของเว็บ ใช้สร้างลิงก์เชิญและ OAuth redirect
export async function getRequestOrigin(): Promise<string | null> {
  const headerStore = await headers();
  return resolveOrigin({
    siteUrl: process.env.SITE_URL,
    forwardedHost: headerStore.get("x-forwarded-host"),
    forwardedProto: headerStore.get("x-forwarded-proto"),
    host: headerStore.get("host"),
  });
}

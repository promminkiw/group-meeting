const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const INVITE_CODE_PATTERN = /^[A-Za-z0-9_-]{12,64}$/;

export const GROUP_NAME_MAX_LENGTH = 100;
export const GROUP_DESCRIPTION_MAX_LENGTH = 500;

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export function isInviteCode(value: string): boolean {
  return INVITE_CODE_PATTERN.test(value);
}

// รับทั้งโค้ดเปล่าและลิงก์เต็ม <origin>/join/<code>
export function extractInviteCode(input: string): string {
  const trimmed = input.trim();
  const match = /\/join\/([^/?#\s]+)/.exec(trimmed);
  return match ? match[1] : trimmed;
}

export function readText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

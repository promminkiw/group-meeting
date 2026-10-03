const PUBLIC_EXACT_PATHS = ["/login", "/signup"];

export function isPublicPath(pathname: string): boolean {
  return (
    PUBLIC_EXACT_PATHS.includes(pathname) ||
    pathname === "/auth" ||
    pathname.startsWith("/auth/")
  );
}

// กัน open redirect: รับเฉพาะ path ภายในเว็บที่ขึ้นต้นด้วย / ตัวเดียว
export function sanitizeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/")) return "/";
  if (next.startsWith("//") || next.startsWith("/\\")) return "/";
  // ตัวอักษรควบคุม (tab, newline) ถูก browser ตัดทิ้งได้ ทำให้ /\t/evil.com กลายเป็น //evil.com
  if (/[\u0000-\u001f\u007f\\]/.test(next)) return "/";
  return next;
}

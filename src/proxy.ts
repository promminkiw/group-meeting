import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { isPublicPath } from "@/lib/auth/paths";

// optimistic check เท่านั้น การตรวจจริงอยู่ที่ DAL (verifySession)
export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  const redirectWithCookies = (target: URL) => {
    const redirectResponse = NextResponse.redirect(target);
    // คง cookie ที่ refresh แล้วไว้ใน redirect response
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    response.headers.forEach((value, key) => {
      if (key === "cache-control" || key === "expires" || key === "pragma") {
        redirectResponse.headers.set(key, value);
      }
    });
    return redirectResponse;
  };

  if (!user && !isPublicPath(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + search);
    return redirectWithCookies(loginUrl);
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    return redirectWithCookies(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

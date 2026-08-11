import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

/**
 * Guards everything under /admin and /api/admin.
 *
 * This runs before any admin page or route handler, so an unauthenticated
 * request never reaches code that can touch the GitHub token.
 *
 * Only `jose` is used here: middleware runs in the Edge runtime, where Node's
 * crypto APIs are unavailable.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The login page and the login/logout endpoints must stay reachable.
  if (
    pathname === "/admin/login" ||
    pathname === "/api/admin/login" ||
    pathname === "/api/admin/logout"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (await verifySessionToken(token)) {
    return NextResponse.next();
  }

  // API routes get a status code; pages get sent to the login form.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  if (pathname !== "/admin") {
    loginUrl.searchParams.set("next", pathname);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

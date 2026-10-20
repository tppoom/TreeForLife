import { NextResponse, type NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE_NAME } from "@/lib/auth/session";

// Gate for the shop back office (/admin, /api/admin).
//
// - Signed session (LINE Login) with role staff/admin → allowed
// - ADMIN_PASSWORD set      → HTTP Basic Auth (any username, this password)
// - unset outside production → open, so local dev and E2E keep working
// - unset in production      → locked, never ship an open back office by accident
//
// The session JWT is verified here (signature + role claim). A cookie that merely
// exists, or belongs to a customer, must never open the back office.
export async function middleware(req: NextRequest) {
  const isDemo = process.env.NEXT_PUBLIC_APP_MODE === "demo";
  if (isDemo) {
    return NextResponse.next();
  }

  // 1. Check signed staff session
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionCookie ? await verifySession(sessionCookie) : null;
  if (session && (session.role === "staff" || session.role === "admin")) {
    return NextResponse.next();
  }

  // 2. Check Basic Auth fallback (if configured)
  const password = process.env.ADMIN_PASSWORD;
  const header = req.headers.get("authorization") ?? "";
  if (password && header.startsWith("Basic ")) {
    const decoded = atob(header.slice(6));
    const supplied = decoded.slice(decoded.indexOf(":") + 1);
    if (timingSafeEqual(supplied, password)) {
      return NextResponse.next();
    }
  }

  // 3. If in production and not authenticated
  const isProd = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
  if (isProd) {
    const pathname = req.nextUrl.pathname;
    if (session) {
      // Signed in, but as a customer: re-running LINE Login would not change the role.
      return new NextResponse(
        pathname.startsWith("/api/")
          ? JSON.stringify({ error: { code: "FORBIDDEN", message: "Staff role required." } })
          : "Forbidden: staff role required.",
        {
          status: 403,
          headers: {
            "Content-Type": pathname.startsWith("/api/") ? "application/json" : "text/plain; charset=utf-8",
          },
        }
      );
    }
    if (pathname.startsWith("/api/")) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized. Staff session required." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    // Redirect page requests to login
    return NextResponse.redirect(
      new URL(`/api/auth/line/login?next=${encodeURIComponent(pathname)}`, req.nextUrl.origin)
    );
  }

  return NextResponse.next();
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

import { NextResponse, type NextRequest } from "next/server";

// Interim gate for the shop back office until LINE Login + server sessions land
// (docs/features/F02-line-login-sessions.md). The client-side role switcher is a
// demo affordance only; the server must not trust it.
//
// - ADMIN_PASSWORD set      → HTTP Basic Auth (any username, this password)
// - unset outside production → open, so local dev and E2E keep working
// - unset in production      → locked, never ship an open back office by accident
export function middleware(req: NextRequest) {
  const isDemo = process.env.NEXT_PUBLIC_APP_MODE === "demo";
  if (isDemo) {
    return NextResponse.next();
  }

  // 1. Check session cookie
  const sessionCookie = req.cookies.get("tfl_session")?.value;
  if (sessionCookie) {
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

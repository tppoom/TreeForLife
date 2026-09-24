import { NextResponse, type NextRequest } from "next/server";

// Interim gate for the shop back office until LINE Login + server sessions land
// (docs/features/F02-line-login-sessions.md). The client-side role switcher is a
// demo affordance only; the server must not trust it.
//
// - ADMIN_PASSWORD set      → HTTP Basic Auth (any username, this password)
// - unset outside production → open, so local dev and E2E keep working
// - unset in production      → locked, never ship an open back office by accident
export function middleware(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    if (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") {
      return new NextResponse("Admin is disabled: ADMIN_PASSWORD is not configured.", {
        status: 503,
      });
    }
    return NextResponse.next();
  }

  const header = req.headers.get("authorization") ?? "";
  if (header.startsWith("Basic ")) {
    const decoded = atob(header.slice(6));
    const supplied = decoded.slice(decoded.indexOf(":") + 1);
    if (timingSafeEqual(supplied, password)) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="TreeForLife Admin", charset="UTF-8"' },
  });
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

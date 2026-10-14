import { HttpError } from "@/lib/http/errors";
import { verifySession, SESSION_COOKIE_NAME, GUEST_COOKIE_NAME } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { users } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export type Actor =
  | { kind: "user"; userId: string; role: "customer" | "staff" | "admin"; guestToken: string | null }
  | { kind: "guest"; guestToken: string }
  | { kind: "anonymous"; ip: string };

function parseCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function getActor(req: Request): Promise<Actor> {
  const cookieHeader = req.headers.get("cookie");
  const authHeader = req.headers.get("authorization");

  let sessionToken = parseCookie(cookieHeader, SESSION_COOKIE_NAME);
  if (!sessionToken && authHeader?.startsWith("Bearer ")) {
    sessionToken = authHeader.slice(7).trim();
  }

  const guestToken =
    req.headers.get("x-guest-token")?.trim() ||
    parseCookie(cookieHeader, GUEST_COOKIE_NAME)?.trim() ||
    null;

  if (sessionToken) {
    const payload = await verifySession(sessionToken);
    if (payload?.sub) {
      try {
        const db = await getDb();
        const [user] = await db
          .select({
            id: users.id,
            role: users.role,
            sessionVersion: users.sessionVersion,
            deletedAt: users.deletedAt,
          })
          .from(users)
          .where(and(eq(users.id, payload.sub), isNull(users.deletedAt)))
          .limit(1);

        if (user && user.sessionVersion === payload.sv) {
          return {
            kind: "user",
            userId: user.id,
            role: user.role as "customer" | "staff" | "admin",
            guestToken,
          };
        }
      } catch (err) {
        // If DB lookup fails during actor resolution, fall back to guest or anonymous safely
        console.error("Failed to verify user session against DB:", err);
      }
    }
  }

  if (guestToken && guestToken.length > 0) {
    return { kind: "guest", guestToken };
  }

  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
  return { kind: "anonymous", ip };
}

export function requireOwner(
  actor: Actor,
  plant: { userId?: string | null; guestToken?: string | null }
): void {
  if (actor.kind === "guest" && plant.guestToken && actor.guestToken === plant.guestToken) {
    return;
  }

  if (actor.kind === "user" && plant.userId && actor.userId === plant.userId) {
    return;
  }

  // Always return 404 NOT_FOUND instead of 403 to prevent resource enumeration
  throw new HttpError(404, "NOT_FOUND", "ไม่พบต้นไม้ที่ระบุ");
}

export function requireStaff(actor: Actor): void {
  if (actor.kind === "user" && (actor.role === "staff" || actor.role === "admin")) {
    return;
  }
  throw new HttpError(403, "FORBIDDEN", "คุณไม่มีสิทธิ์เข้าถึงส่วนนี้");
}

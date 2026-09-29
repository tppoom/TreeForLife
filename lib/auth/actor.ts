import { HttpError } from "@/lib/http/errors";

export type Actor =
  | { kind: "user"; userId: string; role: "customer" | "staff" | "admin"; guestToken: string | null }
  | { kind: "guest"; guestToken: string }
  | { kind: "anonymous"; ip: string };

export async function getActor(req: Request): Promise<Actor> {
  const guestToken = req.headers.get("x-guest-token");
  if (guestToken && guestToken.trim().length > 0) {
    return { kind: "guest", guestToken: guestToken.trim() };
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

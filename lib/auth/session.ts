import { SignJWT, jwtVerify } from "jose";

const DEFAULT_SECRET = "treeforlife_dev_session_secret_32bytes_minimum_length_key!";
const SESSION_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || DEFAULT_SECRET
);

export interface SessionPayload {
  sub: string;
  role: "customer" | "staff" | "admin";
  sv: number;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return await new SignJWT({
    role: payload.role,
    sv: payload.sv,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("90d")
    .sign(SESSION_SECRET);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET);
    if (!payload.sub || typeof payload.sub !== "string") {
      return null;
    }
    return {
      sub: payload.sub,
      role: (payload.role as "customer" | "staff" | "admin") || "customer",
      sv: typeof payload.sv === "number" ? payload.sv : 1,
    };
  } catch {
    return null;
  }
}

/**
 * Validates that redirect paths are strictly relative internal URLs.
 * Rejects absolute URLs, protocol-relative (//evil.com), and backslash exploits.
 */
export function isValidRedirectPath(path?: string | null): boolean {
  if (!path || typeof path !== "string") return false;
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.startsWith("/\\")) return false;
  if (path.includes("://")) return false;
  return true;
}

export const SESSION_COOKIE_NAME = "tfl_session";
export const GUEST_COOKIE_NAME = "tfl_guest";
export const OAUTH_COOKIE_NAME = "tfl_oauth";

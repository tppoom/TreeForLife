import { SignJWT, jwtVerify } from "jose";

const DEFAULT_SECRET = "treeforlife_dev_session_secret_32bytes_minimum_length_key!";

/**
 * Resolves the HS256 key. The dev default is public (it lives in this repo), so in
 * production a missing or short SESSION_SECRET fails closed: nothing is signed and
 * every cookie is rejected, instead of accepting tokens anyone could forge.
 */
function getSessionSecret(): Uint8Array | null {
  const configured = process.env.SESSION_SECRET;
  if (configured && configured.length >= 32) {
    return new TextEncoder().encode(configured);
  }
  const isProd = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
  if (isProd) {
    return null;
  }
  return new TextEncoder().encode(DEFAULT_SECRET);
}

export interface SessionPayload {
  sub: string;
  role: "customer" | "staff" | "admin";
  sv: number;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error("SESSION_SECRET (>= 32 chars) must be set in production");
  }
  return await new SignJWT({
    role: payload.role,
    sv: payload.sv,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("90d")
    .sign(secret);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  const secret = getSessionSecret();
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
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

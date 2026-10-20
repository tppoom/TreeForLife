import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "../middleware";
import { signSession, verifySession } from "@/lib/auth/session";

function request(path: string, cookie?: string) {
  return new NextRequest(`https://shop.example${path}`, {
    headers: cookie ? { cookie } : {},
  });
}

const staffSub = "22222222-2222-4222-a222-222222222222";

describe("Back-office middleware gate (production)", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_APP_MODE", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("ADMIN_PASSWORD", "");
    vi.stubEnv("SESSION_SECRET", "x".repeat(48));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects a forged session cookie on admin APIs", async () => {
    const res = await middleware(request("/api/admin/species", "tfl_session=anything"));
    expect(res.status).toBe(401);
  });

  it("rejects a valid customer session with 403", async () => {
    const token = await signSession({ sub: staffSub, role: "customer", sv: 1 });
    const res = await middleware(request("/api/admin/species", `tfl_session=${token}`));
    expect(res.status).toBe(403);
  });

  it("lets a signed staff session through", async () => {
    const token = await signSession({ sub: staffSub, role: "staff", sv: 1 });
    const res = await middleware(request("/admin", `tfl_session=${token}`));
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("asks for the admin password when LINE Login is not configured", async () => {
    vi.stubEnv("ADMIN_PASSWORD", "s3cret-pass");
    vi.stubEnv("LINE_LOGIN_CHANNEL_ID", "");
    const res = await middleware(request("/admin"));
    expect(res.status).toBe(401);
    expect(res.headers.get("www-authenticate")).toMatch(/^Basic /);

    const ok = await middleware(
      new NextRequest("https://shop.example/admin", {
        headers: { authorization: `Basic ${btoa("staff:s3cret-pass")}` },
      })
    );
    expect(ok.headers.get("x-middleware-next")).toBe("1");
  });

  it("redirects anonymous page requests to LINE Login", async () => {
    vi.stubEnv("LINE_LOGIN_CHANNEL_ID", "1234567890");
    const res = await middleware(request("/admin"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/api/auth/line/login?next=%2Fadmin");
  });
});

describe("Session secret in production", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("fails closed when SESSION_SECRET is missing, so the public dev key cannot mint sessions", async () => {
    const devToken = await signSession({ sub: staffSub, role: "admin", sv: 1 });
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("SESSION_SECRET", "");
    expect(await verifySession(devToken)).toBeNull();
    await expect(signSession({ sub: staffSub, role: "admin", sv: 1 })).rejects.toThrow(/SESSION_SECRET/);
  });
});

describe("Guest merge target", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("ignores a body userId outside demo mode (target must come from the session)", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_MODE", "production");
    const { POST } = await import("../app/api/garden/merge/route");
    const res = await POST(
      new Request("https://shop.example/api/garden/merge", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ guestToken: "victim-guest-token", userId: staffSub }),
      })
    );
    expect(res.status).toBe(401);
  });
});

describe("Cron endpoint auth", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is locked in production without CRON_SECRET and checks the bearer token when set", async () => {
    const { verifyCronAuth } = await import("../lib/cron/auth");
    const req = (auth?: string) =>
      new Request("https://shop.example/api/cron/generate-tasks", {
        headers: auth ? { authorization: auth } : {},
      });

    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CRON_SECRET", "");
    expect(verifyCronAuth(req())).toBe(false);

    vi.stubEnv("CRON_SECRET", "s3cret");
    expect(verifyCronAuth(req())).toBe(false);
    expect(verifyCronAuth(req("Bearer wrong"))).toBe(false);
    expect(verifyCronAuth(req("Bearer s3cret"))).toBe(true);
  });
});

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

describe("LINE webhook signature", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const post = async (headers: Record<string, string> = {}) => {
    const { POST } = await import("../app/api/line/webhook/route");
    return POST(
      new NextRequest("https://shop.example/api/line/webhook", {
        method: "POST",
        headers: { "content-type": "application/json", ...headers },
        body: JSON.stringify({ events: [] }),
      })
    );
  };

  it("is closed in production when no channel secret is configured", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("LINE_MESSAGING_CHANNEL_SECRET", "");
    expect((await post()).status).toBe(503);
  });

  it("rejects unsigned or wrongly signed events once a secret is set", async () => {
    vi.stubEnv("LINE_MESSAGING_CHANNEL_SECRET", "channel-secret");
    expect((await post()).status).toBe(401);
    expect((await post({ "x-line-signature": "bogus" })).status).toBe(401);
  });

  it("accepts a correctly signed event", async () => {
    vi.stubEnv("LINE_MESSAGING_CHANNEL_SECRET", "channel-secret");
    const crypto = await import("crypto");
    const body = JSON.stringify({ events: [] });
    const signature = crypto.createHmac("sha256", "channel-secret").update(body).digest("base64");
    expect((await post({ "x-line-signature": signature })).status).toBe(200);
  });
});

describe("LINE OA links", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("build every link from NEXT_PUBLIC_LINE_OA_ID, with or without a leading @", async () => {
    vi.stubEnv("NEXT_PUBLIC_LINE_OA_ID", "@123abcde");
    vi.resetModules();
    const f = await import("../lib/line/formatters");
    expect(f.LINE_OA_HANDLE).toBe("@123abcde");
    expect(f.LINE_OA_URL).toBe("https://line.me/R/ti/p/@123abcde");
    expect(f.lineOaMessageUrl("สวัสดี")).toBe(
      `https://line.me/R/oaMessage/@123abcde/?${encodeURIComponent("สวัสดี")}`
    );
  });
});

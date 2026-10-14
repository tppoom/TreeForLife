import { describe, it, expect } from "vitest";
import { signSession, verifySession, isValidRedirectPath } from "@/lib/auth/session";

describe("Auth Session Tokens (jose JWT)", () => {
  it("signs and verifies a valid session payload", async () => {
    const payload = {
      sub: "11111111-2222-3333-4444-555555555555",
      role: "customer" as const,
      sv: 1,
    };

    const token = await signSession(payload);
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);

    const decoded = await verifySession(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.sub).toBe(payload.sub);
    expect(decoded?.role).toBe("customer");
    expect(decoded?.sv).toBe(1);
  });

  it("fails verification for tampered token", async () => {
    const payload = {
      sub: "11111111-2222-3333-4444-555555555555",
      role: "customer" as const,
      sv: 1,
    };

    const token = await signSession(payload);
    const tampered = token.slice(0, -5) + "abcde";
    const decoded = await verifySession(tampered);
    expect(decoded).toBeNull();
  });

  it("validates safe internal redirect paths and prevents open redirects", () => {
    expect(isValidRedirectPath("/today")).toBe(true);
    expect(isValidRedirectPath("/garden")).toBe(true);
    expect(isValidRedirectPath("/plants/monstera-deliciosa")).toBe(true);
    expect(isValidRedirectPath("/")).toBe(true);

    // Open redirects / dangerous paths
    expect(isValidRedirectPath("https://evil.com")).toBe(false);
    expect(isValidRedirectPath("//evil.com")).toBe(false);
    expect(isValidRedirectPath("/\\evil.com")).toBe(false);
    expect(isValidRedirectPath("javascript:alert(1)")).toBe(false);
    expect(isValidRedirectPath("")).toBe(false);
  });
});

import { describe, it, expect } from "vitest";
import { getActor, requireOwner, requireStaff, type Actor } from "../lib/auth/actor";
import { HttpError } from "../lib/http/errors";

describe("Actor & Ownership Enforcement", () => {
  it("resolves guest actor from x-guest-token header", async () => {
    const req = new Request("https://example.com/api/garden/plants", {
      headers: { "x-guest-token": "guest-token-1234" },
    });
    const actor = await getActor(req);
    expect(actor.kind).toBe("guest");
    if (actor.kind === "guest") {
      expect(actor.guestToken).toBe("guest-token-1234");
    }
  });

  it("resolves anonymous actor with IP when no token is present", async () => {
    const req = new Request("https://example.com/api/garden/plants", {
      headers: { "x-forwarded-for": "203.0.113.195, 10.0.0.1" },
    });
    const actor = await getActor(req);
    expect(actor.kind).toBe("anonymous");
    if (actor.kind === "anonymous") {
      expect(actor.ip).toBe("203.0.113.195");
    }
  });

  it("resolves anonymous actor with default IP 127.0.0.1 when no headers present", async () => {
    const req = new Request("https://example.com/api/garden/plants");
    const actor = await getActor(req);
    expect(actor.kind).toBe("anonymous");
    if (actor.kind === "anonymous") {
      expect(actor.ip).toBe("127.0.0.1");
    }
  });

  it("requireOwner allows matching guestToken", () => {
    const actor: Actor = { kind: "guest", guestToken: "my-token" };
    expect(() => requireOwner(actor, { guestToken: "my-token", userId: null })).not.toThrow();
  });

  it("requireOwner allows matching userId for user actor", () => {
    const actor: Actor = { kind: "user", userId: "user-123", role: "customer", guestToken: null };
    expect(() => requireOwner(actor, { userId: "user-123", guestToken: null })).not.toThrow();
  });

  it("requireOwner throws 404 NOT_FOUND when guestToken mismatches", () => {
    const actor: Actor = { kind: "guest", guestToken: "my-token" };
    try {
      requireOwner(actor, { guestToken: "other-token", userId: null });
      expect.fail("Should have thrown HttpError");
    } catch (err: any) {
      expect(err).toBeInstanceOf(HttpError);
      expect(err.statusCode).toBe(404);
      expect(err.code).toBe("NOT_FOUND");
    }
  });

  it("requireOwner throws 404 NOT_FOUND for anonymous actor", () => {
    const actor: Actor = { kind: "anonymous", ip: "127.0.0.1" };
    try {
      requireOwner(actor, { guestToken: "some-token", userId: "some-user" });
      expect.fail("Should have thrown HttpError");
    } catch (err: any) {
      expect(err).toBeInstanceOf(HttpError);
      expect(err.statusCode).toBe(404);
      expect(err.code).toBe("NOT_FOUND");
    }
  });

  it("requireOwner throws 404 NOT_FOUND when user does not own plant", () => {
    const actor: Actor = { kind: "user", userId: "user-1", role: "customer", guestToken: null };
    expect(() => requireOwner(actor, { userId: "user-2", guestToken: null })).toThrow(HttpError);
  });

  it("requireStaff throws 403 FORBIDDEN for non-staff", () => {
    const actor: Actor = { kind: "guest", guestToken: "my-token" };
    expect(() => requireStaff(actor)).toThrow(HttpError);

    const customerActor: Actor = { kind: "user", userId: "user-1", role: "customer", guestToken: null };
    expect(() => requireStaff(customerActor)).toThrow(HttpError);
  });

  it("requireStaff allows staff and admin roles", () => {
    const staffActor: Actor = { kind: "user", userId: "staff-1", role: "staff", guestToken: null };
    expect(() => requireStaff(staffActor)).not.toThrow();

    const adminActor: Actor = { kind: "user", userId: "admin-1", role: "admin", guestToken: null };
    expect(() => requireStaff(adminActor)).not.toThrow();
  });
});

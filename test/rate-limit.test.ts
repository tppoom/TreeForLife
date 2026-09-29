import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "../lib/db";
import { checkRateLimit, assertRateLimit } from "../lib/http/rate-limit";
import { HttpError } from "../lib/http/errors";

describe("Database-Backed Rate Limiting", () => {
  beforeAll(async () => {
    await getDb();
  });

  it("allows requests under the limit", async () => {
    const key = `test-ip-${Date.now()}`;
    const result1 = await checkRateLimit({ key, limit: 3, windowSeconds: 60 });
    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBe(2);

    const result2 = await checkRateLimit({ key, limit: 3, windowSeconds: 60 });
    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(1);
  });

  it("blocks requests over the limit and calculates retry-after", async () => {
    const key = `test-block-${Date.now()}`;
    await checkRateLimit({ key, limit: 2, windowSeconds: 60 });
    await checkRateLimit({ key, limit: 2, windowSeconds: 60 });

    const blocked = await checkRateLimit({ key, limit: 2, windowSeconds: 60 });
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("assertRateLimit throws HttpError(429) when limit exceeded", async () => {
    const key = `test-assert-${Date.now()}`;
    await assertRateLimit({ key, limit: 1, windowSeconds: 60 });

    await expect(assertRateLimit({ key, limit: 1, windowSeconds: 60 })).rejects.toThrow(HttpError);
  });
});

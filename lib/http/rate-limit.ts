import { getDb } from "@/lib/db";
import { rateLimits } from "@/db/schema";
import { sql } from "drizzle-orm";
import { HttpError } from "@/lib/http/errors";

export interface RateLimitOptions {
  key: string;
  limit: number;
  windowSeconds?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export async function checkRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const { key, limit, windowSeconds = 60 } = options;
  const db = await getDb();
  const now = new Date();

  // Align windowStart to the current window interval
  const windowMs = windowSeconds * 1000;
  const windowStartTime = new Date(Math.floor(now.getTime() / windowMs) * windowMs);
  const nextWindowTime = new Date(windowStartTime.getTime() + windowMs);
  const retryAfterSeconds = Math.max(1, Math.ceil((nextWindowTime.getTime() - now.getTime()) / 1000));

  // Upsert rate limit row
  const result = await db
    .insert(rateLimits)
    .values({
      key,
      windowStart: windowStartTime,
      count: 1,
    })
    .onConflictDoUpdate({
      target: [rateLimits.key, rateLimits.windowStart],
      set: {
        count: sql`${rateLimits.count} + 1`,
      },
    })
    .returning();

  const currentCount = result[0]?.count ?? 1;
  const allowed = currentCount <= limit;
  const remaining = Math.max(0, limit - currentCount);

  return {
    allowed,
    remaining,
    retryAfterSeconds,
  };
}

export async function assertRateLimit(options: RateLimitOptions): Promise<void> {
  const result = await checkRateLimit(options);
  if (!result.allowed) {
    throw new HttpError(
      429,
      "RATE_LIMITED",
      "คุณส่งคำขอถี่เกินไป กรุณารอสักครู่แล้วลองใหม่",
      { retryAfter: result.retryAfterSeconds }
    );
  }
}

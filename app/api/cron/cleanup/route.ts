import { NextResponse, type NextRequest } from "next/server";
import { verifyCronAuth } from "@/lib/cron/auth";
import { getDb } from "@/lib/db";
import { careTasks, rateLimits, lineEventsSeen, pushSubscriptions } from "@/db/schema";
import { sql } from "drizzle-orm";
import { formatDate } from "@/lib/care/scheduler";

export async function GET(req: NextRequest) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = formatDate(thirtyDaysAgo);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  try {
    // 1. Auto-skip tasks pending > 30 days
    const skippedTasks = await db
      .update(careTasks)
      .set({ status: "skipped" })
      .where(sql`${careTasks.dueDate} < ${thirtyDaysAgoStr} AND ${careTasks.status} = 'pending'`)
      .returning();

    // 2. Clean rate limits older than 1 day
    await db
      .delete(rateLimits)
      .where(sql`${rateLimits.windowStart} < ${oneDayAgo}`);

    // 3. Clean line webhook events seen older than 7 days
    await db
      .delete(lineEventsSeen)
      .where(sql`${lineEventsSeen.seenAt} < ${sevenDaysAgo}`);

    return NextResponse.json({
      success: true,
      autoSkippedTasksCount: skippedTasks.length,
      cleanedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Cleanup failed" }, { status: 500 });
  }
}

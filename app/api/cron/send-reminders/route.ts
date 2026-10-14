import { NextResponse, type NextRequest } from "next/server";
import { verifyCronAuth } from "@/lib/cron/auth";
import { getDb } from "@/lib/db";
import { cronRuns } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { dispatchDailyReminders } from "@/lib/notify/dispatch";
import { formatDate } from "@/lib/care/scheduler";

export async function GET(req: NextRequest) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todayStr = formatDate(new Date());
  const jobName = "send_reminders";
  const db = await getDb();

  // Check idempotency for today
  const [existingRun] = await db
    .select()
    .from(cronRuns)
    .where(and(eq(cronRuns.job, jobName), eq(cronRuns.runDate, todayStr)))
    .limit(1);

  if (existingRun && existingRun.status === "done") {
    return NextResponse.json({
      success: true,
      message: `Job ${jobName} already completed for ${todayStr}`,
      stats: existingRun.stats,
    });
  }

  await db
    .insert(cronRuns)
    .values({
      job: jobName,
      runDate: todayStr,
      status: "running",
      startedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [cronRuns.job, cronRuns.runDate],
      set: { status: "running", startedAt: new Date() },
    });

  try {
    const result = await dispatchDailyReminders({ targetDate: todayStr });

    await db
      .update(cronRuns)
      .set({
        status: "done",
        stats: result as any,
        finishedAt: new Date(),
      })
      .where(and(eq(cronRuns.job, jobName), eq(cronRuns.runDate, todayStr)));

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    await db
      .update(cronRuns)
      .set({
        status: "failed",
        stats: { error: err.message },
        finishedAt: new Date(),
      })
      .where(and(eq(cronRuns.job, jobName), eq(cronRuns.runDate, todayStr)));

    return NextResponse.json({ error: err.message || "Failed to dispatch reminders" }, { status: 500 });
  }
}

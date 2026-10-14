import { NextResponse, type NextRequest } from "next/server";
import { verifyCronAuth } from "@/lib/cron/auth";
import { getDb } from "@/lib/db";
import { userPlants, careTemplates, careTasks, cronRuns } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { planUpcomingTasks, formatDate, PotMaterial, Placement } from "@/lib/care/scheduler";
import { generateAftercareCheckins } from "@/lib/services/aftercareService";

export async function GET(req: NextRequest) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todayStr = formatDate(new Date());
  const jobName = "generate_tasks";
  const db = await getDb();

  // Check idempotency for today's run
  const [existingRun] = await db
    .select()
    .from(cronRuns)
    .where(and(eq(cronRuns.job, jobName), eq(cronRuns.runDate, todayStr)))
    .limit(1);

  if (existingRun && existingRun.status === "done") {
    return NextResponse.json({
      success: true,
      message: `Job ${jobName} already ran for ${todayStr}`,
      stats: existingRun.stats,
    });
  }

  // Record job start
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

  let tasksGenerated = 0;
  let plantsProcessed = 0;

  try {
    const plants = await db
      .select({
        id: userPlants.id,
        speciesId: userPlants.speciesId,
        acquiredAt: userPlants.acquiredAt,
        acquiredFrom: userPlants.acquiredFrom,
        potMaterial: userPlants.potMaterial,
        potSizeInch: userPlants.potSizeInch,
        placement: userPlants.placement,
        customWaterDays: userPlants.customWaterDays,
        waterDaysHot: careTemplates.waterDaysHot,
        waterDaysRainy: careTemplates.waterDaysRainy,
        waterDaysCool: careTemplates.waterDaysCool,
        fertilizeDays: careTemplates.fertilizeDays,
        fertilizePauseMonths: careTemplates.fertilizePauseMonths,
        repotMonths: careTemplates.repotMonths,
        pruneDays: careTemplates.pruneDays,
        pestCheckDays: careTemplates.pestCheckDays,
      })
      .from(userPlants)
      .leftJoin(careTemplates, eq(userPlants.speciesId, careTemplates.speciesId))
      .where(eq(userPlants.isActive, true));

    for (const plant of plants) {
      plantsProcessed++;

      // If plant has a template, plan tasks 14 days ahead
      if (plant.waterDaysHot && plant.waterDaysRainy && plant.waterDaysCool) {
        const planned = planUpcomingTasks({
          plantId: plant.id,
          acquiredAt: plant.acquiredAt,
          potMaterial: plant.potMaterial as PotMaterial,
          potSizeInch: Number(plant.potSizeInch) || 6,
          placement: plant.placement as Placement,
          customWaterDays: plant.customWaterDays,
          template: {
            waterDaysHot: plant.waterDaysHot,
            waterDaysRainy: plant.waterDaysRainy,
            waterDaysCool: plant.waterDaysCool,
            fertilizeDays: plant.fertilizeDays,
            fertilizePauseMonths: plant.fertilizePauseMonths,
            repotMonths: plant.repotMonths,
            pruneDays: plant.pruneDays,
            pestCheckDays: plant.pestCheckDays,
          },
          fromDate: new Date(),
          horizonDays: 14,
        });

        for (const t of planned) {
          const inserted = await db
            .insert(careTasks)
            .values({
              userPlantId: plant.id,
              type: t.type,
              dueDate: t.dueDate,
              status: "pending",
            })
            .onConflictDoNothing()
            .returning();

          if (inserted.length > 0) {
            tasksGenerated++;
          }
        }
      }

      // Generate aftercare check-ins if shop plant
      if (plant.acquiredFrom === "shop") {
        await generateAftercareCheckins({
          userPlantId: plant.id,
          acquiredAt: plant.acquiredAt,
          acquiredFrom: plant.acquiredFrom,
        });
      }
    }

    const stats = { plantsProcessed, tasksGenerated };
    await db
      .update(cronRuns)
      .set({
        status: "done",
        stats,
        finishedAt: new Date(),
      })
      .where(and(eq(cronRuns.job, jobName), eq(cronRuns.runDate, todayStr)));

    return NextResponse.json({ success: true, ...stats });
  } catch (err: any) {
    await db
      .update(cronRuns)
      .set({
        status: "failed",
        stats: { error: err.message },
        finishedAt: new Date(),
      })
      .where(and(eq(cronRuns.job, jobName), eq(cronRuns.runDate, todayStr)));

    return NextResponse.json({ error: err.message || "Cron job failed" }, { status: 500 });
  }
}

import { NextResponse, type NextRequest } from "next/server";
import { verifyCronAuth } from "@/lib/cron/auth";
import { getDb } from "@/lib/db";
import { userPlants, careTemplates, careTasks, cronRuns } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { calculateCareInterval, formatDate, PotMaterial, Placement } from "@/lib/care/scheduler";

export async function GET(req: NextRequest) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todayStr = formatDate(new Date());
  const jobName = "season_recalc";
  const db = await getDb();

  let recalculatedCount = 0;

  try {
    const plants = await db
      .select({
        id: userPlants.id,
        potMaterial: userPlants.potMaterial,
        potSizeInch: userPlants.potSizeInch,
        placement: userPlants.placement,
        customWaterDays: userPlants.customWaterDays,
        waterDaysHot: careTemplates.waterDaysHot,
        waterDaysRainy: careTemplates.waterDaysRainy,
        waterDaysCool: careTemplates.waterDaysCool,
      })
      .from(userPlants)
      .innerJoin(careTemplates, eq(userPlants.speciesId, careTemplates.speciesId))
      .where(eq(userPlants.isActive, true));

    for (const plant of plants) {
      const interval = calculateCareInterval({
        potMaterial: plant.potMaterial as PotMaterial,
        potSizeInch: Number(plant.potSizeInch) || 6,
        placement: plant.placement as Placement,
        date: new Date(),
        template: {
          waterDaysHot: plant.waterDaysHot,
          waterDaysRainy: plant.waterDaysRainy,
          waterDaysCool: plant.waterDaysCool,
        },
        customWaterDays: plant.customWaterDays,
      });

      // Update pending watering task dueDate if due in the future
      const newDue = new Date();
      newDue.setDate(newDue.getDate() + interval);

      try {
        await db
          .update(careTasks)
          .set({ dueDate: formatDate(newDue) })
          .where(
            and(
              eq(careTasks.userPlantId, plant.id),
              eq(careTasks.type, "water"),
              eq(careTasks.status, "pending"),
              sql`${careTasks.dueDate} > ${todayStr}`
            )
          );
        recalculatedCount++;
      } catch (updateErr) {
        // Ignore unique date collision if upcoming task already exists
      }
    }

    return NextResponse.json({ success: true, recalculatedCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Season recalc failed" }, { status: 500 });
  }
}

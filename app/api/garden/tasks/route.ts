import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { careTasks, userPlants, species } from "@/db/schema";
import { eq, and, sql, asc } from "drizzle-orm";
import {
  recordTaskAction,
  TaskActionInput,
} from "@/lib/services/gardenService";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const guestToken = searchParams.get("guestToken");
    const userPlantId = searchParams.get("userPlantId");
    const status = searchParams.get("status");

    const db = await getDb();

    if (userPlantId) {
      const conditions = [eq(careTasks.userPlantId, userPlantId)];
      if (status) {
        conditions.push(eq(careTasks.status, status));
      }
      const tasks = await db
        .select({
          id: careTasks.id,
          userPlantId: careTasks.userPlantId,
          type: careTasks.type,
          dueDate: careTasks.dueDate,
          status: careTasks.status,
          snoozeCount: careTasks.snoozeCount,
          doneAt: careTasks.doneAt,
          notifiedAt: careTasks.notifiedAt,
          createdAt: careTasks.createdAt,
          plantNickname: userPlants.nickname,
          plantPhotoUrl: userPlants.photoUrl,
          plantNotes: userPlants.notes,
          potSizeInch: userPlants.potSizeInch,
          potMaterial: userPlants.potMaterial,
          placement: userPlants.placement,
          customSpeciesName: userPlants.customSpeciesName,
          speciesId: userPlants.speciesId,
          speciesNameTh: species.nameTh,
          speciesNameEn: species.nameEn,
          speciesSlug: species.slug,
        })
        .from(careTasks)
        .innerJoin(userPlants, eq(careTasks.userPlantId, userPlants.id))
        .leftJoin(species, eq(userPlants.speciesId, species.id))
        .where(and(...conditions))
        .orderBy(asc(careTasks.dueDate));

      return NextResponse.json({ tasks });
    }

    if (userId || guestToken) {
      const userCondition = userId
        ? eq(userPlants.userId, userId)
        : eq(userPlants.guestToken, guestToken!);

      const plants = await db
        .select({ id: userPlants.id })
        .from(userPlants)
        .where(and(userCondition, eq(userPlants.isActive, true)));

      const plantIds = plants.map((p) => p.id);
      if (plantIds.length === 0) {
        return NextResponse.json({ tasks: [] });
      }

      const conditions = [sql`${careTasks.userPlantId} IN ${plantIds}`];
      if (status) {
        conditions.push(eq(careTasks.status, status));
      }

      const tasks = await db
        .select({
          id: careTasks.id,
          userPlantId: careTasks.userPlantId,
          type: careTasks.type,
          dueDate: careTasks.dueDate,
          status: careTasks.status,
          snoozeCount: careTasks.snoozeCount,
          doneAt: careTasks.doneAt,
          notifiedAt: careTasks.notifiedAt,
          createdAt: careTasks.createdAt,
          plantNickname: userPlants.nickname,
          plantPhotoUrl: userPlants.photoUrl,
          plantNotes: userPlants.notes,
          potSizeInch: userPlants.potSizeInch,
          potMaterial: userPlants.potMaterial,
          placement: userPlants.placement,
          customSpeciesName: userPlants.customSpeciesName,
          speciesId: userPlants.speciesId,
          speciesNameTh: species.nameTh,
          speciesNameEn: species.nameEn,
          speciesSlug: species.slug,
        })
        .from(careTasks)
        .innerJoin(userPlants, eq(careTasks.userPlantId, userPlants.id))
        .leftJoin(species, eq(userPlants.speciesId, species.id))
        .where(and(...conditions))
        .orderBy(asc(careTasks.dueDate));

      return NextResponse.json({ tasks });
    }

    // If no scoping parameter is provided, return empty array to prevent leaking data across users
    return NextResponse.json({ tasks: [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch tasks";
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Support batch completion if batch is true and tasks array is provided
    if (body.batch && Array.isArray(body.tasks)) {
      const succeeded: unknown[] = [];
      const failed: { item: unknown; error: string }[] = [];

      for (const item of body.tasks) {
        if (item.userPlantId && item.taskId && item.action) {
          try {
            const res = await recordTaskAction(item);
            succeeded.push(res);
          } catch (itemErr: unknown) {
            const message = itemErr instanceof Error ? itemErr.message : "Task action failed";
            failed.push({ item, error: message });
          }
        } else {
          failed.push({ item, error: "Missing required fields" });
        }
      }

      return NextResponse.json({
        success: true,
        count: succeeded.length,
        results: succeeded,
        succeeded,
        failed,
      });
    }

    const singleInput: TaskActionInput = body;
    if (!singleInput.userPlantId || !singleInput.taskId || !singleInput.action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await recordTaskAction(singleInput);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update task";
    console.error("Error recording task action:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

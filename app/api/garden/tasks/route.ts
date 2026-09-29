import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { careTasks, userPlants, species } from "@/db/schema";
import { eq, and, sql, asc } from "drizzle-orm";
import {
  recordTaskAction,
  getUserPlantById,
  TaskActionInput,
} from "@/lib/services/gardenService";
import { getActor, requireOwner } from "@/lib/auth/actor";
import { assertRateLimit } from "@/lib/http/rate-limit";
import { HttpError, toErrorResponse } from "@/lib/http/errors";
import { TaskActionSchema } from "@/lib/validation/garden";

export async function GET(req: Request) {
  try {
    let actor = await getActor(req);
    const { searchParams } = new URL(req.url, "http://localhost");
    const guestToken = searchParams.get("guestToken");
    const userPlantId = searchParams.get("userPlantId");
    const status = searchParams.get("status");

    if (actor.kind === "anonymous" && guestToken && guestToken.trim()) {
      actor = { kind: "guest", guestToken: guestToken.trim() };
    }

    const db = await getDb();

    if (userPlantId) {
      const plant = await getUserPlantById(userPlantId);
      if (!plant) {
        return NextResponse.json({ tasks: [] });
      }
      requireOwner(actor, plant);

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

    if (actor.kind === "user" || actor.kind === "guest") {
      const userCondition =
        actor.kind === "user"
          ? eq(userPlants.userId, actor.userId)
          : eq(userPlants.guestToken, actor.guestToken);

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
    return toErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const actor = await getActor(req);
    const body = await req.json();

    const actorKey =
      actor.kind === "user"
        ? actor.userId
        : actor.kind === "guest"
        ? actor.guestToken
        : actor.ip;
    await assertRateLimit({ key: "plant:write:" + actorKey, limit: 30 });

    // Support batch completion if batch is true and tasks array is provided
    if (body.batch && Array.isArray(body.tasks)) {
      const succeeded: unknown[] = [];
      const failed: { item: unknown; error: string }[] = [];

      for (const item of body.tasks) {
        if (item.userPlantId && item.taskId && item.action) {
          try {
            const plant = await getUserPlantById(item.userPlantId);
            if (!plant) {
              throw new HttpError(404, "NOT_FOUND", "ไม่พบต้นไม้ที่ระบุ");
            }
            requireOwner(actor, plant);
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
      throw new HttpError(400, "VALIDATION_ERROR", "Missing required fields");
    }

    const normalizedAction = singleInput.action === "complete" ? "done" : singleInput.action;
    const parsed = TaskActionSchema.safeParse({
      taskId: singleInput.taskId,
      action: normalizedAction,
      notes: singleInput.note,
    });
    if (!parsed.success) {
      throw new HttpError(400, "VALIDATION_ERROR", "คำสั่งงานไม่ถูกต้อง", parsed.error.flatten());
    }

    const plant = await getUserPlantById(singleInput.userPlantId);
    if (!plant) {
      throw new HttpError(404, "NOT_FOUND", "ไม่พบต้นไม้ที่ระบุ");
    }
    requireOwner(actor, plant);

    try {
      const result = await recordTaskAction(singleInput);
      return NextResponse.json(result);
    } catch (actionErr: unknown) {
      if (actionErr instanceof HttpError) {
        throw actionErr;
      }
      const message = actionErr instanceof Error ? actionErr.message : "Failed to update task";
      throw new HttpError(400, "BAD_REQUEST", message);
    }
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}


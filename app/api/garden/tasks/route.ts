import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { careTasks, userPlants } from "@/db/schema";
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
        .select()
        .from(careTasks)
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
        .select()
        .from(careTasks)
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
    const body: TaskActionInput = await req.json();
    if (!body.userPlantId || !body.taskId || !body.action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await recordTaskAction(body);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update task";
    console.error("Error recording task action:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

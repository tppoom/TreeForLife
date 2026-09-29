import { getDb } from "@/lib/db";
import { userPlants, careTasks, careLogs, favorites, inquiries } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getActor } from "@/lib/auth/actor";
import { assertRateLimit } from "@/lib/http/rate-limit";
import { HttpError, toErrorResponse } from "@/lib/http/errors";

export async function POST(req: Request) {
  try {
    const actor = await getActor(req);

    if (actor.kind === "anonymous") {
      throw new HttpError(
        401,
        "UNAUTHORIZED",
        "ไม่พบข้อมูลประจำตัว กรุณาระบุ x-guest-token"
      );
    }

    const actorId = actor.kind === "user" ? actor.userId : actor.guestToken;

    // Rate limit: 3 deletes per hour (3600 seconds)
    await assertRateLimit({
      key: `delete:${actorId}`,
      limit: 3,
      windowSeconds: 3600,
    });

    const db = await getDb();

    // 1. Find user plant IDs to clean up care logs and care tasks
    const plantCondition =
      actor.kind === "user"
        ? eq(userPlants.userId, actor.userId)
        : eq(userPlants.guestToken, actor.guestToken);

    const plantRows = await db
      .select({ id: userPlants.id })
      .from(userPlants)
      .where(plantCondition);

    const plantIds = plantRows.map((p) => p.id);

    if (plantIds.length > 0) {
      await db.delete(careTasks).where(inArray(careTasks.userPlantId, plantIds));
      await db.delete(careLogs).where(inArray(careLogs.userPlantId, plantIds));
    }

    // 2. Delete user plants
    await db.delete(userPlants).where(plantCondition);

    // 3. Delete favorites
    const favCondition =
      actor.kind === "user"
        ? eq(favorites.userId, actor.userId)
        : eq(favorites.guestToken, actor.guestToken);
    await db.delete(favorites).where(favCondition);

    // 4. Delete inquiries
    const inqCondition =
      actor.kind === "user"
        ? eq(inquiries.userId, actor.userId)
        : eq(inquiries.guestToken, actor.guestToken);
    await db.delete(inquiries).where(inqCondition);

    return Response.json({
      success: true,
      message: "ลบข้อมูลทั้งหมดเรียบร้อยแล้ว",
    });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}

import { getDb } from "@/lib/db";
import { userPlants, careTasks, careLogs, favorites, inquiries } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getActor } from "@/lib/auth/actor";
import { assertRateLimit } from "@/lib/http/rate-limit";
import { HttpError, toErrorResponse } from "@/lib/http/errors";

export async function GET(req: Request) {
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

    // Rate limit: 5 exports per day (86400 seconds)
    await assertRateLimit({
      key: `export:${actorId}`,
      limit: 5,
      windowSeconds: 86400,
    });

    const db = await getDb();

    // 1. Fetch plants
    const plantCondition =
      actor.kind === "user"
        ? eq(userPlants.userId, actor.userId)
        : eq(userPlants.guestToken, actor.guestToken);

    const plantList = await db.select().from(userPlants).where(plantCondition);

    // 2. Fetch related care tasks and care logs
    const plantIds = plantList.map((p) => p.id);
    let allTasks: (typeof careTasks.$inferSelect)[] = [];
    let allLogs: (typeof careLogs.$inferSelect)[] = [];

    if (plantIds.length > 0) {
      allTasks = await db
        .select()
        .from(careTasks)
        .where(inArray(careTasks.userPlantId, plantIds));

      allLogs = await db
        .select()
        .from(careLogs)
        .where(inArray(careLogs.userPlantId, plantIds));
    }

    // Embed tasks and logs within plants
    const plantsWithDetails = plantList.map((p) => ({
      ...p,
      careTasks: allTasks.filter((t) => t.userPlantId === p.id),
      careLogs: allLogs.filter((l) => l.userPlantId === p.id),
    }));

    // 3. Fetch favorites
    const favCondition =
      actor.kind === "user"
        ? eq(favorites.userId, actor.userId)
        : eq(favorites.guestToken, actor.guestToken);

    const favList = await db.select().from(favorites).where(favCondition);

    // 4. Fetch inquiries
    const inqCondition =
      actor.kind === "user"
        ? eq(inquiries.userId, actor.userId)
        : eq(inquiries.guestToken, actor.guestToken);

    const inqList = await db.select().from(inquiries).where(inqCondition);

    const todayStr = new Date().toISOString().split("T")[0];

    const payload = {
      exportedAt: new Date().toISOString(),
      actor: {
        kind: actor.kind,
        id: actorId,
      },
      guestToken: actor.kind === "guest" ? actor.guestToken : null,
      userId: actor.kind === "user" ? actor.userId : null,
      plants: plantsWithDetails,
      favorites: favList,
      inquiries: inqList,
    };

    return new Response(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="treeforlife-data-${todayStr}.json"`,
      },
    });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}

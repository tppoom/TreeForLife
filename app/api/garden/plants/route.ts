import { NextResponse } from "next/server";
import { getUserPlants, addUserPlant } from "@/lib/services/gardenService";
import { getActor } from "@/lib/auth/actor";
import { assertRateLimit } from "@/lib/http/rate-limit";
import { HttpError, toErrorResponse } from "@/lib/http/errors";
import { AddPlantSchema } from "@/lib/validation/garden";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    let actor = await getActor(req);
    if (actor.kind === "anonymous") {
      const url = new URL(req.url, "http://localhost");
      const qGuestToken = url.searchParams.get("guestToken");
      if (qGuestToken && qGuestToken.trim()) {
        actor = { kind: "guest", guestToken: qGuestToken.trim() };
      }
    }

    if (actor.kind === "anonymous") {
      return Response.json({ success: true, plants: [], data: [] });
    }

    const userId = actor.kind === "user" ? actor.userId : null;
    const guestToken =
      actor.kind === "guest"
        ? actor.guestToken
        : actor.kind === "user"
        ? actor.guestToken
        : null;

    const plants = await getUserPlants(userId, guestToken);
    return Response.json({ success: true, plants, data: plants });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    let actor = await getActor(req);
    const rawBody = await req.json();

    // Support legacy guestToken in body if actor not extracted from header
    if (
      actor.kind === "anonymous" &&
      typeof rawBody?.guestToken === "string" &&
      rawBody.guestToken.trim()
    ) {
      actor = { kind: "guest", guestToken: rawBody.guestToken.trim() };
    }

    if (actor.kind === "anonymous") {
      throw new HttpError(400, "VALIDATION_ERROR", "ต้องระบุเจ้าของต้นไม้");
    }

    const actorKey =
      actor.kind === "user"
        ? actor.userId
        : actor.guestToken;
    await assertRateLimit({ key: "plant:write:" + actorKey, limit: 30 });

    const schema =
      rawBody.speciesId !== undefined
        ? AddPlantSchema
        : AddPlantSchema.extend({
            speciesId: z.string().uuid("รหัสพันธุ์ไม้ไม่ถูกต้อง").optional().nullable(),
          });

    const parsed = schema.safeParse(rawBody);
    if (!parsed.success) {
      throw new HttpError(400, "VALIDATION_ERROR", "ข้อมูลต้นไม้ไม่ถูกต้อง", parsed.error.flatten());
    }

    const input = parsed.data;
    const plant = await addUserPlant({
      userId: actor.kind === "user" ? actor.userId : undefined,
      guestToken: actor.kind === "guest" ? actor.guestToken : undefined,
      speciesId: input.speciesId || undefined,
      customSpeciesName: rawBody.customSpeciesName,
      nickname: input.nickname,
      acquiredAt: rawBody.acquiredAt || new Date().toISOString().split("T")[0],
      acquiredFrom: rawBody.acquiredFrom || "shop",
      potSizeInch: input.potSizeInch,
      potMaterial: input.potMaterial,
      placement: input.placement,
      customWaterDays: input.customWaterDays,
      notes: input.notes,
    });

    return Response.json({ success: true, plant, data: plant }, { status: 201 });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}


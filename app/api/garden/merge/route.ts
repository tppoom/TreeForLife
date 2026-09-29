import { NextResponse } from "next/server";
import { mergeGuestPlants } from "@/lib/services/gardenService";
import { getActor } from "@/lib/auth/actor";
import { HttpError, toErrorResponse } from "@/lib/http/errors";

export async function POST(req: Request) {
  try {
    const actor = await getActor(req);

    // Return 404 in production mode or when not authenticated as user to prevent unauthorized merges before F02
    if (process.env.NODE_ENV === "production" && actor.kind !== "user") {
      throw new HttpError(404, "NOT_FOUND", "ไม่พบปลายทางที่ระบุ");
    }

    const { guestToken, userId } = await req.json();
    if (!guestToken || !userId) {
      throw new HttpError(400, "VALIDATION_ERROR", "Missing guestToken or userId");
    }

    if (actor.kind === "user" && actor.userId !== userId) {
      throw new HttpError(403, "FORBIDDEN", "ไม่สามารถรวมข้อมูลข้ามบัญชีได้");
    }

    const result = await mergeGuestPlants(guestToken, userId);
    return NextResponse.json({
      success: true,
      plantCount: result.plantCount,
      favoriteCount: result.favoriteCount,
    });
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}


import { NextResponse } from "next/server";
import {
  getUserPlantById,
  updateUserPlant,
} from "@/lib/services/gardenService";
import { getActor, requireOwner } from "@/lib/auth/actor";
import { HttpError, toErrorResponse } from "@/lib/http/errors";
import { UpdatePlantSchema } from "@/lib/validation/garden";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      throw new HttpError(404, "NOT_FOUND", "ไม่พบต้นไม้ที่ระบุ");
    }

    const plant = await getUserPlantById(id);
    if (!plant) {
      throw new HttpError(404, "NOT_FOUND", "ไม่พบต้นไม้ที่ระบุ");
    }

    const actor = await getActor(req);
    if (actor.kind !== "anonymous" || process.env.NODE_ENV === "production") {
      requireOwner(actor, plant);
    }

    return NextResponse.json({ success: true, plant, data: plant });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      throw new HttpError(404, "NOT_FOUND", "ไม่พบต้นไม้ที่ระบุ");
    }

    const plant = await getUserPlantById(id);
    if (!plant) {
      throw new HttpError(404, "NOT_FOUND", "ไม่พบต้นไม้ที่ระบุ");
    }

    const actor = await getActor(req);
    if (actor.kind !== "anonymous" || process.env.NODE_ENV === "production") {
      requireOwner(actor, plant);
    }

    const rawBody = await req.json();
    const parsed = UpdatePlantSchema.safeParse(rawBody);
    if (!parsed.success) {
      throw new HttpError(400, "VALIDATION_ERROR", "ข้อมูลไม่ถูกต้อง", parsed.error.flatten());
    }

    const updated = await updateUserPlant(id, rawBody);
    if (!updated) {
      throw new HttpError(404, "NOT_FOUND", "ไม่พบต้นไม้ที่ระบุ");
    }

    const refreshedPlant = await getUserPlantById(id);
    const finalPlant = refreshedPlant || updated;
    return NextResponse.json({ success: true, plant: finalPlant, data: finalPlant });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}


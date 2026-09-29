import { NextResponse } from "next/server";
import { archiveUserPlant, getUserPlantById } from "@/lib/services/gardenService";
import { getActor, requireOwner } from "@/lib/auth/actor";
import { HttpError, toErrorResponse } from "@/lib/http/errors";

export async function POST(
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
    requireOwner(actor, plant);

    await archiveUserPlant(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}


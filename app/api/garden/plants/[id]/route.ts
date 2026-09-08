import { NextResponse } from "next/server";
import {
  getUserPlantById,
  updateUserPlant,
  AddUserPlantInput,
} from "@/lib/services/gardenService";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing plant id" }, { status: 400 });
    }

    const plant = await getUserPlantById(id);
    if (!plant) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 });
    }

    return NextResponse.json({ plant });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch plant";
    console.error("Error fetching plant:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing plant id" }, { status: 400 });
    }

    const body: Partial<AddUserPlantInput> = await req.json();
    const updated = await updateUserPlant(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 });
    }

    const refreshedPlant = await getUserPlantById(id);
    return NextResponse.json({ plant: refreshedPlant || updated, success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update plant";
    console.error("Error updating plant:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

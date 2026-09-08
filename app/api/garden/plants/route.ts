import { NextResponse } from "next/server";
import { getUserPlants, addUserPlant, AddUserPlantInput } from "@/lib/services/gardenService";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const guestToken = searchParams.get("guestToken");

    const plants = await getUserPlants(userId, guestToken);
    return NextResponse.json({ plants });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch plants";
    console.error("Error fetching plants:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: AddUserPlantInput = await req.json();
    if (!body.nickname || !body.acquiredAt || !body.potMaterial || !body.placement) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const plant = await addUserPlant(body);
    return NextResponse.json({ plant, success: true }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to add plant";
    console.error("Error adding plant:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

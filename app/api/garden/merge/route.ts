import { NextResponse } from "next/server";
import { mergeGuestPlants } from "@/lib/services/gardenService";

export async function POST(req: Request) {
  try {
    const { guestToken, userId } = await req.json();
    if (!guestToken || !userId) {
      return NextResponse.json({ error: "Missing guestToken or userId" }, { status: 400 });
    }

    const result = await mergeGuestPlants(guestToken, userId);
    return NextResponse.json({
      success: true,
      plantCount: result.plantCount,
      favoriteCount: result.favoriteCount,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to merge data";
    console.error("Error merging guest data:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

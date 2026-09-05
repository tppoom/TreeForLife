import { NextResponse } from "next/server";
import { mergeGuestData } from "@/lib/services/gardenService";

export async function POST(req: Request) {
  try {
    const { guestToken, userId } = await req.json();
    if (!guestToken || !userId) {
      return NextResponse.json({ error: "Missing guestToken or userId" }, { status: 400 });
    }

    const result = await mergeGuestData(guestToken, userId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error merging guest data:", error);
    return NextResponse.json({ error: error.message || "Failed to merge data" }, { status: 500 });
  }
}

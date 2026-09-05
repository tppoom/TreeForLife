import { NextResponse } from "next/server";
import { updateStockStatus } from "@/lib/services/speciesService";

export async function POST(req: Request) {
  try {
    const { speciesId, status } = await req.json();
    if (!speciesId || !status) {
      return NextResponse.json({ error: "Missing speciesId or status" }, { status: 400 });
    }

    await updateStockStatus(speciesId, status);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating stock status:", error);
    return NextResponse.json({ error: error.message || "Failed to update stock status" }, { status: 500 });
  }
}

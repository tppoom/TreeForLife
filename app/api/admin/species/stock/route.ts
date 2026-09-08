import { NextResponse } from "next/server";
import { updateStockStatus, StockStatus } from "@/lib/services/adminService";
import { getAllSpecies } from "@/lib/services/speciesService";

const VALID_STATUSES: StockStatus[] = ["in_stock", "made_to_order", "seasonal", "hidden"];

export async function GET() {
  try {
    const list = await getAllSpecies({ stockStatus: "all" });
    return NextResponse.json({ species: list });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch species list";
    console.error("Error fetching species list:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { speciesId, status } = await req.json();
    if (!speciesId || !status) {
      return NextResponse.json({ error: "Missing speciesId or status" }, { status: 400 });
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    await updateStockStatus(speciesId, status);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update stock status";
    console.error("Error updating stock status:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

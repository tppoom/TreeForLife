import { NextResponse } from "next/server";
import { archiveUserPlant } from "@/lib/services/gardenService";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing plant id" }, { status: 400 });
    }

    await archiveUserPlant(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to archive plant";
    console.error("Error archiving plant:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

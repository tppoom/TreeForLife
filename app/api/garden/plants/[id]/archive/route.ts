import { NextResponse } from "next/server";
import { archiveUserPlant } from "@/lib/services/gardenService";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await archiveUserPlant(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error archiving plant:", error);
    return NextResponse.json({ error: error.message || "Failed to archive plant" }, { status: 500 });
  }
}

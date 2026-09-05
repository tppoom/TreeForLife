import { NextResponse } from "next/server";
import { recordTaskAction, TaskActionInput } from "@/lib/services/gardenService";

export async function POST(req: Request) {
  try {
    const body: TaskActionInput = await req.json();
    if (!body.userPlantId || !body.taskId || !body.action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await recordTaskAction(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error recording task action:", error);
    return NextResponse.json({ error: error.message || "Failed to update task" }, { status: 500 });
  }
}

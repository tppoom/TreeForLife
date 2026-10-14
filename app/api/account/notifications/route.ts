import { NextResponse, type NextRequest } from "next/server";
import { getActor } from "@/lib/auth/actor";
import { getDb } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const NotificationSettingsSchema = z.object({
  notifyWebPush: z.boolean().optional(),
  notifyLine: z.boolean().optional(),
  notifyHour: z.number().int().min(6).max(21).optional(),
});

export async function PATCH(req: NextRequest) {
  const actor = await getActor(req);
  if (actor.kind !== "user") {
    return NextResponse.json(
      { error: "Unauthorized. Must be logged in to update notification settings." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = NotificationSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const db = await getDb();
  const updatePayload: Record<string, unknown> = {};

  if (parsed.data.notifyWebPush !== undefined) {
    updatePayload.notifyWebPush = parsed.data.notifyWebPush;
  }
  if (parsed.data.notifyLine !== undefined) {
    updatePayload.notifyLine = parsed.data.notifyLine;
  }
  if (parsed.data.notifyHour !== undefined) {
    updatePayload.notifyHour = parsed.data.notifyHour;
  }

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json({ success: true });
  }

  const [updated] = await db
    .update(users)
    .set(updatePayload)
    .where(eq(users.id, actor.userId))
    .returning();

  return NextResponse.json({
    success: true,
    data: updated,
  });
}

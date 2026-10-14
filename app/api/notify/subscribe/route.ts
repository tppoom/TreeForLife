import { NextResponse, type NextRequest } from "next/server";
import { getActor } from "@/lib/auth/actor";
import { getDb } from "@/lib/db";
import { pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const SubscribeSchema = z.object({
  endpoint: z.string().url("Valid push endpoint URL required"),
  keys: z.object({
    p256dh: z.string().min(1, "p256dh key required"),
    auth: z.string().min(1, "auth secret required"),
  }),
});

export async function POST(req: NextRequest) {
  const actor = await getActor(req);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = SubscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const db = await getDb();
  const userId = actor.kind === "user" ? actor.userId : null;
  const guestToken = actor.kind === "guest" ? actor.guestToken : null;
  const userAgent = req.headers.get("user-agent") || undefined;

  const [sub] = await db
    .insert(pushSubscriptions)
    .values({
      userId,
      guestToken,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
      userAgent,
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: {
        userId,
        guestToken,
        p256dh: parsed.data.keys.p256dh,
        auth: parsed.data.keys.auth,
        userAgent,
      },
    })
    .returning();

  return NextResponse.json({ success: true, data: { id: sub.id } }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const endpoint = (body as any)?.endpoint;
  if (!endpoint || typeof endpoint !== "string") {
    return NextResponse.json({ error: "endpoint is required" }, { status: 400 });
  }

  const db = await getDb();
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));

  return NextResponse.json({ success: true });
}

import { NextResponse, type NextRequest } from "next/server";
import { getActor } from "@/lib/auth/actor";
import { getDb } from "@/lib/db";
import { users } from "@/db/schema";
import { eq, isNull, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const actor = await getActor(req);

  if (actor.kind !== "user") {
    return NextResponse.json({
      success: true,
      actor,
      user: null,
    });
  }

  const db = await getDb();
  const [user] = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      email: users.email,
      avatarUrl: users.avatarUrl,
      role: users.role,
      timezone: users.timezone,
      notifyWebPush: users.notifyWebPush,
      notifyLine: users.notifyLine,
      notifyHour: users.notifyHour,
      lineFriend: users.lineFriend,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(and(eq(users.id, actor.userId), isNull(users.deletedAt)))
    .limit(1);

  if (!user) {
    return NextResponse.json({
      success: true,
      actor: { kind: "anonymous", ip: "127.0.0.1" },
      user: null,
    });
  }

  return NextResponse.json({
    success: true,
    actor,
    user,
  });
}

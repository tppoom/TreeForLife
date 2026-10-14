import { NextResponse, type NextRequest } from "next/server";
import { getActor } from "@/lib/auth/actor";
import { getDueCheckins } from "@/lib/services/aftercareService";

export async function GET(req: NextRequest) {
  const actor = await getActor(req);
  if (actor.kind === "anonymous") {
    return NextResponse.json({ success: true, data: [] });
  }

  const userId = actor.kind === "user" ? actor.userId : null;
  const guestToken = actor.kind === "guest" ? actor.guestToken : null;

  const checkins = await getDueCheckins({ userId, guestToken });

  return NextResponse.json({
    success: true,
    data: checkins,
  });
}

import { NextResponse, type NextRequest } from "next/server";
import { getActor } from "@/lib/auth/actor";
import { mergeGuestData } from "@/lib/services/gardenService";
import { z } from "zod";

const MergeSchema = z.object({
  guestToken: z.string().min(1, "guestToken is required"),
  userId: z.string().uuid().optional(),
});

export async function POST(req: Request) {
  const actor = await getActor(req);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = MergeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const targetUserId =
    actor.kind === "user" ? actor.userId : parsed.data.userId;

  if (!targetUserId) {
    return NextResponse.json(
      { error: "Must be logged in or supply userId to merge guest plants." },
      { status: 401 }
    );
  }

  const result = await mergeGuestData(parsed.data.guestToken, targetUserId);

  return NextResponse.json({
    success: true,
    plantCount: result.plantCount,
    favoriteCount: result.favoriteCount,
    inquiryCount: result.inquiryCount,
    data: result,
  });
}

import { NextResponse } from "next/server";
import { createInquiry, getInquiries } from "@/lib/services/inquiryService";
import { getActor } from "@/lib/auth/actor";
import { assertRateLimit } from "@/lib/http/rate-limit";
import { HttpError, toErrorResponse } from "@/lib/http/errors";
import { InquiryCreateSchema } from "@/lib/validation/inquiry";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url, "http://localhost");
    const userId = searchParams.get("userId");
    const guestToken = searchParams.get("guestToken");
    const refCode = searchParams.get("refCode");
    const limit = searchParams.get("limit");

    const inquiries = await getInquiries({
      userId: userId || undefined,
      guestToken: guestToken || undefined,
      refCode: refCode || undefined,
      limit: limit ? Number(limit) : undefined,
    });

    return NextResponse.json({ inquiries });
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const actor = await getActor(req);
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip =
      actor.kind === "anonymous"
        ? actor.ip
        : forwardedFor
        ? forwardedFor.split(",")[0].trim()
        : "127.0.0.1";

    await assertRateLimit({ key: "inquiry:ip:" + ip, limit: 10, windowSeconds: 60 });

    const rawBody = await req.json();
    if (!rawBody.sourcePage || !rawBody.intent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const parsed = InquiryCreateSchema.safeParse(rawBody);
    if (!parsed.success) {
      throw new HttpError(400, "VALIDATION_ERROR", "ข้อมูลคำถามไม่ถูกต้อง", parsed.error.flatten());
    }

    const body = parsed.data;
    const result = await createInquiry({
      speciesId: body.speciesId || undefined,
      speciesNameTh: (rawBody as any).speciesNameTh,
      customNote: (rawBody as any).customNote,
      userId: actor.kind === "user" ? actor.userId : (rawBody as any).userId,
      guestToken: actor.kind === "guest" ? actor.guestToken : (rawBody as any).guestToken,
      sourcePage: body.sourcePage,
      intent: body.intent,
      payload: (body.payload as Record<string, unknown>) || {},
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}


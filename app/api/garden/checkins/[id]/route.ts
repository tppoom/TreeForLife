import { NextResponse, type NextRequest } from "next/server";
import { getActor } from "@/lib/auth/actor";
import { answerCheckin } from "@/lib/services/aftercareService";
import { z } from "zod";

const AnswerSchema = z.object({
  answer: z.enum(["good", "unsure", "bad"]),
  symptoms: z.array(z.string()).optional(),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: checkinId } = await context.params;
  const actor = await getActor(req);

  if (actor.kind === "anonymous") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = AnswerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const userId = actor.kind === "user" ? actor.userId : null;
  const guestToken = actor.kind === "guest" ? actor.guestToken : null;

  try {
    const result = await answerCheckin({
      checkinId,
      answer: parsed.data.answer,
      symptoms: parsed.data.symptoms,
      userId,
      guestToken,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to answer check-in" }, { status: 400 });
  }
}

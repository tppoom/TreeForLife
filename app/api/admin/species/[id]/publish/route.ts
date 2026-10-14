import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { species } from "@/db/schema";
import { eq } from "drizzle-orm";
import { HttpError, toErrorResponse } from "@/lib/http/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, context: RouteParams) {
  try {
    const { id } = await context.params;
    const db = await getDb();

    const [item] = await db
      .select({ id: species.id, publishedAt: species.publishedAt })
      .from(species)
      .where(eq(species.id, id))
      .limit(1);

    if (!item) {
      throw new HttpError(404, "NOT_FOUND", "ไม่พบพันธุ์ไม้");
    }

    let shouldPublish: boolean;
    try {
      const body = await req.json();
      if (typeof body?.publish === "boolean") {
        shouldPublish = body.publish;
      } else {
        shouldPublish = item.publishedAt === null;
      }
    } catch {
      // Empty or non-JSON body -> toggle
      shouldPublish = item.publishedAt === null;
    }

    const newPublishedAt = shouldPublish ? new Date() : null;

    await db
      .update(species)
      .set({
        publishedAt: newPublishedAt,
        updatedAt: new Date(),
      })
      .where(eq(species.id, id));

    return NextResponse.json({
      success: true,
      data: { publishedAt: newPublishedAt },
    });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}

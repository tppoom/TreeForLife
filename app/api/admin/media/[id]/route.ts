import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { speciesMedia } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getStorageProvider } from "@/lib/storage";
import { AdminMediaUpdateSchema } from "@/lib/validation/admin";
import { HttpError, toErrorResponse } from "@/lib/http/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(_req: Request, context: RouteParams) {
  try {
    const { id } = await context.params;
    const db = await getDb();

    const [media] = await db
      .select()
      .from(speciesMedia)
      .where(eq(speciesMedia.id, id))
      .limit(1);

    if (!media) {
      throw new HttpError(404, "NOT_FOUND", "ไม่พบรูปภาพ");
    }

    // Try to delete file from storage if path exists or infer from blobUrl
    try {
      const storage = getStorageProvider();
      const path = media.storagePath || extractStoragePath(media.blobUrl);
      if (path) {
        await storage.deleteFile(path);
      }
    } catch (storageErr) {
      console.warn("Storage delete warning:", storageErr);
    }

    await db.delete(speciesMedia).where(eq(speciesMedia.id, id));

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}

export async function PATCH(req: Request, context: RouteParams) {
  try {
    const { id } = await context.params;
    const rawBody = await req.json();
    const parsed = AdminMediaUpdateSchema.safeParse(rawBody);
    if (!parsed.success) {
      throw new HttpError(
        400,
        "VALIDATION_ERROR",
        "ข้อมูลรูปภาพไม่ถูกต้อง",
        parsed.error.flatten()
      );
    }

    const input = parsed.data;
    const db = await getDb();

    const [media] = await db
      .select()
      .from(speciesMedia)
      .where(eq(speciesMedia.id, id))
      .limit(1);

    if (!media) {
      throw new HttpError(404, "NOT_FOUND", "ไม่พบรูปภาพ");
    }

    const isPrimary = input.isPrimary ?? input.isCover;

    // If making primary, unset other primaries for this species
    if (isPrimary === true) {
      await db
        .update(speciesMedia)
        .set({ isPrimary: false })
        .where(eq(speciesMedia.speciesId, media.speciesId));
    }

    const updatePayload: Partial<typeof speciesMedia.$inferInsert> = {};

    if (input.altTh !== undefined) updatePayload.altTh = input.altTh;
    else if (input.alt !== undefined) updatePayload.altTh = input.alt;

    if (isPrimary !== undefined) updatePayload.isPrimary = isPrimary;
    if (input.sortOrder !== undefined) updatePayload.sortOrder = input.sortOrder;
    if (input.credit !== undefined) updatePayload.credit = input.credit;

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ success: true, data: media });
    }

    const [updatedMedia] = await db
      .update(speciesMedia)
      .set(updatePayload)
      .where(eq(speciesMedia.id, id))
      .returning();

    return NextResponse.json({ success: true, data: updatedMedia });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}

function extractStoragePath(url: string): string | null {
  const marker = "/species-media/";
  const idx = url.indexOf(marker);
  if (idx !== -1) {
    return url.substring(idx + marker.length).split("?")[0];
  }
  return null;
}

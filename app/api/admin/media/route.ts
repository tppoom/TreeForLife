import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { species, speciesMedia } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AdminMediaCreateSchema } from "@/lib/validation/admin";
import { HttpError, toErrorResponse } from "@/lib/http/errors";

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const parsed = AdminMediaCreateSchema.safeParse(rawBody);
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

    // Verify species exists
    const [existingSpecies] = await db
      .select({ id: species.id })
      .from(species)
      .where(eq(species.id, input.speciesId))
      .limit(1);

    if (!existingSpecies) {
      throw new HttpError(404, "NOT_FOUND", "ไม่พบพันธุ์ไม้ที่ระบุ");
    }

    const isPrimary = Boolean(input.isPrimary ?? input.isCover ?? false);

    // If setting as primary, unset other media of the same species
    if (isPrimary) {
      await db
        .update(speciesMedia)
        .set({ isPrimary: false })
        .where(eq(speciesMedia.speciesId, input.speciesId));
    }

    const blobUrl = input.blobUrl || input.url!;
    const altTh = input.altTh ?? input.alt ?? "";
    const sortOrder = input.sortOrder ?? 0;
    const credit = input.credit || "ถ่ายที่ร้าน";
    const storagePath = input.storagePath ?? null;

    const [createdMedia] = await db
      .insert(speciesMedia)
      .values({
        speciesId: input.speciesId,
        blobUrl,
        altTh,
        sortOrder,
        isPrimary,
        credit,
        storagePath,
      })
      .returning();

    return NextResponse.json(
      { success: true, data: createdMedia },
      { status: 201 }
    );
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}

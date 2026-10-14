import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { species, speciesMedia, careTemplates, speciesProblems } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { AdminSpeciesUpdateSchema } from "@/lib/validation/admin";
import { HttpError, toErrorResponse } from "@/lib/http/errors";
import { normalizeThaiSearch } from "@/lib/search/normalize";
import { getStorageProvider } from "@/lib/storage";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, context: RouteParams) {
  try {
    const { id } = await context.params;
    const db = await getDb();

    const [item] = await db
      .select()
      .from(species)
      .where(eq(species.id, id))
      .limit(1);

    if (!item) {
      throw new HttpError(404, "NOT_FOUND", "ไม่พบพันธุ์ไม้");
    }

    const [media, [careTemplate], problems] = await Promise.all([
      db
        .select()
        .from(speciesMedia)
        .where(eq(speciesMedia.speciesId, id))
        .orderBy(desc(speciesMedia.isPrimary), asc(speciesMedia.sortOrder)),
      db
        .select()
        .from(careTemplates)
        .where(eq(careTemplates.speciesId, id))
        .limit(1),
      db
        .select()
        .from(speciesProblems)
        .where(eq(speciesProblems.speciesId, id))
        .orderBy(asc(speciesProblems.sortOrder)),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...item,
        media,
        careTemplate: careTemplate || null,
        problems,
      },
    });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}

export async function PATCH(req: Request, context: RouteParams) {
  try {
    const { id } = await context.params;
    const rawBody = await req.json();
    const parsed = AdminSpeciesUpdateSchema.safeParse(rawBody);
    if (!parsed.success) {
      throw new HttpError(
        400,
        "VALIDATION_ERROR",
        "ข้อมูลอัปเดตไม่ถูกต้อง",
        parsed.error.flatten()
      );
    }

    const input = parsed.data;
    const db = await getDb();

    const [existing] = await db
      .select()
      .from(species)
      .where(eq(species.id, id))
      .limit(1);

    if (!existing) {
      throw new HttpError(404, "NOT_FOUND", "ไม่พบพันธุ์ไม้");
    }

    // Slug collision check
    if (input.slug && input.slug !== existing.slug) {
      const [conflict] = await db
        .select({ id: species.id })
        .from(species)
        .where(eq(species.slug, input.slug))
        .limit(1);

      if (conflict) {
        throw new HttpError(409, "SLUG_EXISTS", "slug นี้ถูกใช้งานแล้ว");
      }
    }

    // Recalculate search text if relevant fields changed
    const nameTh = input.nameTh ?? existing.nameTh;
    const nameEn = input.nameEn ?? existing.nameEn;
    const nameSci = input.nameSci ?? existing.nameSci;
    const aliases = input.aliases ?? existing.aliases;

    const searchText = normalizeThaiSearch(
      [nameTh, nameEn, nameSci, ...(Array.isArray(aliases) ? aliases : [])]
        .filter(Boolean)
        .join(" ")
    );

    const updateValues: Partial<typeof species.$inferInsert> = {
      updatedAt: new Date(),
      searchText,
    };

    if (input.nameTh !== undefined) updateValues.nameTh = input.nameTh;
    if (input.nameEn !== undefined) updateValues.nameEn = input.nameEn;
    if (input.slug !== undefined) updateValues.slug = input.slug;
    if (input.nameSci !== undefined) updateValues.nameSci = input.nameSci;
    if (input.family !== undefined) updateValues.family = input.family;
    if (input.summary !== undefined) updateValues.summary = input.summary;
    if (input.light !== undefined) updateValues.light = input.light;
    if (input.waterNeed !== undefined) updateValues.waterNeed = input.waterNeed;
    if (input.placement !== undefined) updateValues.placement = input.placement;
    if (input.difficulty !== undefined) updateValues.difficulty = input.difficulty;
    if (input.petSafe !== undefined) updateValues.petSafe = input.petSafe;
    if (input.matureSize !== undefined) updateValues.matureSize = input.matureSize;
    if (input.matureHeightCm !== undefined) updateValues.matureHeightCm = input.matureHeightCm;
    if (input.growthRate !== undefined) updateValues.growthRate = input.growthRate;
    if (input.soilMix !== undefined) updateValues.soilMix = input.soilMix;
    if (input.fertilizerNote !== undefined) updateValues.fertilizerNote = input.fertilizerNote;
    if (input.propagation !== undefined) updateValues.propagation = input.propagation;
    if (input.shopNote !== undefined) updateValues.shopNote = input.shopNote;
    if (input.stockStatus !== undefined) updateValues.stockStatus = input.stockStatus;
    if (input.priceRangeInternal !== undefined) updateValues.priceRangeInternal = input.priceRangeInternal;
    if (input.aliases !== undefined) updateValues.aliases = input.aliases;

    const [updatedSpecies] = await db
      .update(species)
      .set(updateValues)
      .where(eq(species.id, id))
      .returning();

    // If careTemplate provided, upsert care template
    if (input.careTemplate) {
      const ct = input.careTemplate;
      await db
        .insert(careTemplates)
        .values({
          speciesId: id,
          waterDaysHot: ct.waterDaysHot ?? 3,
          waterDaysRainy: ct.waterDaysRainy ?? 5,
          waterDaysCool: ct.waterDaysCool ?? 4,
          fertilizeDays: ct.fertilizeDays ?? null,
          fertilizePauseMonths: ct.fertilizePauseMonths ?? [],
          repotMonths: ct.repotMonths ?? null,
          pruneDays: ct.pruneDays ?? null,
          pestCheckDays: ct.pestCheckDays ?? 14,
          notesTh: ct.notesTh ?? null,
        })
        .onConflictDoUpdate({
          target: careTemplates.speciesId,
          set: {
            ...(ct.waterDaysHot !== undefined && { waterDaysHot: ct.waterDaysHot }),
            ...(ct.waterDaysRainy !== undefined && { waterDaysRainy: ct.waterDaysRainy }),
            ...(ct.waterDaysCool !== undefined && { waterDaysCool: ct.waterDaysCool }),
            ...(ct.fertilizeDays !== undefined && { fertilizeDays: ct.fertilizeDays }),
            ...(ct.fertilizePauseMonths !== undefined && { fertilizePauseMonths: ct.fertilizePauseMonths }),
            ...(ct.repotMonths !== undefined && { repotMonths: ct.repotMonths }),
            ...(ct.pruneDays !== undefined && { pruneDays: ct.pruneDays }),
            ...(ct.pestCheckDays !== undefined && { pestCheckDays: ct.pestCheckDays }),
            ...(ct.notesTh !== undefined && { notesTh: ct.notesTh }),
          },
        });
    }

    return NextResponse.json({ success: true, data: updatedSpecies });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}

export async function DELETE(_req: Request, context: RouteParams) {
  try {
    const { id } = await context.params;
    const db = await getDb();

    const [existing] = await db
      .select({ id: species.id })
      .from(species)
      .where(eq(species.id, id))
      .limit(1);

    if (!existing) {
      throw new HttpError(404, "NOT_FOUND", "ไม่พบพันธุ์ไม้");
    }

    // Clean up media files in storage
    const mediaList = await db
      .select()
      .from(speciesMedia)
      .where(eq(speciesMedia.speciesId, id));

    const storage = getStorageProvider();
    for (const m of mediaList) {
      const path = m.storagePath || extractStoragePath(m.blobUrl);
      if (path) {
        try {
          await storage.deleteFile(path);
        } catch {}
      }
    }

    // Delete species (cascades to species_media, care_templates, species_problems)
    await db.delete(species).where(eq(species.id, id));

    return NextResponse.json({ success: true });
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

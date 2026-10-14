import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { species, speciesMedia, careTemplates, speciesProblems } from "@/db/schema";
import { eq, desc, asc, inArray } from "drizzle-orm";
import { AdminSpeciesCreateSchema } from "@/lib/validation/admin";
import { HttpError, toErrorResponse } from "@/lib/http/errors";
import { normalizeThaiSearch } from "@/lib/search/normalize";

export async function GET(_req: Request) {
  try {
    const db = await getDb();
    const speciesList = await db
      .select()
      .from(species)
      .orderBy(desc(species.createdAt));

    const speciesIds = speciesList.map((s) => s.id);
    const mediaList =
      speciesIds.length > 0
        ? await db
            .select()
            .from(speciesMedia)
            .where(inArray(speciesMedia.speciesId, speciesIds))
            .orderBy(desc(speciesMedia.isPrimary), asc(speciesMedia.sortOrder))
        : [];

    const mediaMap = new Map<string, typeof mediaList>();
    for (const m of mediaList) {
      const existing = mediaMap.get(m.speciesId) || [];
      existing.push(m);
      mediaMap.set(m.speciesId, existing);
    }

    const data = speciesList.map((s) => ({
      ...s,
      media: mediaMap.get(s.id) || [],
    }));

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const parsed = AdminSpeciesCreateSchema.safeParse(rawBody);
    if (!parsed.success) {
      throw new HttpError(
        400,
        "VALIDATION_ERROR",
        "ข้อมูลพันธุ์ไม้ไม่ถูกต้อง",
        parsed.error.flatten()
      );
    }

    const input = parsed.data;
    const db = await getDb();

    // Check slug uniqueness
    const [existingSlug] = await db
      .select({ id: species.id })
      .from(species)
      .where(eq(species.slug, input.slug))
      .limit(1);

    if (existingSlug) {
      throw new HttpError(409, "SLUG_EXISTS", "slug นี้ถูกใช้งานแล้ว");
    }

    // If copyFromId provided, fetch source species and care template
    let sourceSpecies: (typeof species.$inferSelect) | undefined;
    let sourceCare: (typeof careTemplates.$inferSelect) | undefined;

    if (input.copyFromId) {
      const [src] = await db
        .select()
        .from(species)
        .where(eq(species.id, input.copyFromId))
        .limit(1);
      sourceSpecies = src;

      if (sourceSpecies) {
        const [care] = await db
          .select()
          .from(careTemplates)
          .where(eq(careTemplates.speciesId, input.copyFromId))
          .limit(1);
        sourceCare = care;
      }
    }

    const nameSci = input.nameSci ?? sourceSpecies?.nameSci ?? "";
    const family = input.family ?? sourceSpecies?.family ?? "";
    const summary = input.summary ?? sourceSpecies?.summary ?? "";
    const light = input.light ?? sourceSpecies?.light ?? "indoor_bright";
    const waterNeed = input.waterNeed ?? sourceSpecies?.waterNeed ?? "medium";
    const placement = input.placement ?? sourceSpecies?.placement ?? ["indoor_window"];
    const difficulty = input.difficulty ?? sourceSpecies?.difficulty ?? 1;
    const petSafe = input.petSafe ?? sourceSpecies?.petSafe ?? "unknown";
    const matureSize = input.matureSize ?? sourceSpecies?.matureSize ?? "md";
    const matureHeightCm = input.matureHeightCm ?? sourceSpecies?.matureHeightCm ?? null;
    const growthRate = input.growthRate ?? sourceSpecies?.growthRate ?? "medium";
    const soilMix = input.soilMix ?? sourceSpecies?.soilMix ?? "";
    const fertilizerNote = input.fertilizerNote ?? sourceSpecies?.fertilizerNote ?? null;
    const propagation = input.propagation ?? sourceSpecies?.propagation ?? null;
    const shopNote = input.shopNote ?? sourceSpecies?.shopNote ?? "";
    const stockStatus = input.stockStatus ?? "in_stock";
    const priceRangeInternal = input.priceRangeInternal ?? sourceSpecies?.priceRangeInternal ?? null;
    const aliases = input.aliases ?? sourceSpecies?.aliases ?? [];

    const searchText = normalizeThaiSearch(
      [input.nameTh, input.nameEn, nameSci, ...(Array.isArray(aliases) ? aliases : [])]
        .filter(Boolean)
        .join(" ")
    );

    const [newSpecies] = await db
      .insert(species)
      .values({
        slug: input.slug,
        nameTh: input.nameTh,
        nameEn: input.nameEn,
        nameSci,
        family,
        summary,
        light,
        waterNeed,
        placement,
        difficulty,
        petSafe,
        matureSize,
        matureHeightCm,
        growthRate,
        soilMix,
        fertilizerNote,
        propagation,
        shopNote,
        stockStatus,
        priceRangeInternal,
        aliases,
        searchText,
        publishedAt: null, // Draft by default
      })
      .returning();

    // Copy or insert care template
    const careInput = input.careTemplate;
    if (careInput || sourceCare) {
      await db.insert(careTemplates).values({
        speciesId: newSpecies.id,
        waterDaysHot: careInput?.waterDaysHot ?? sourceCare?.waterDaysHot ?? 3,
        waterDaysRainy: careInput?.waterDaysRainy ?? sourceCare?.waterDaysRainy ?? 5,
        waterDaysCool: careInput?.waterDaysCool ?? sourceCare?.waterDaysCool ?? 4,
        fertilizeDays: careInput?.fertilizeDays ?? sourceCare?.fertilizeDays ?? null,
        fertilizePauseMonths: careInput?.fertilizePauseMonths ?? sourceCare?.fertilizePauseMonths ?? [],
        repotMonths: careInput?.repotMonths ?? sourceCare?.repotMonths ?? null,
        pruneDays: careInput?.pruneDays ?? sourceCare?.pruneDays ?? null,
        pestCheckDays: careInput?.pestCheckDays ?? sourceCare?.pestCheckDays ?? 14,
        notesTh: careInput?.notesTh ?? sourceCare?.notesTh ?? null,
      });
    }

    if (input.problems && input.problems.length > 0) {
      await db.insert(speciesProblems).values(
        input.problems.map((p, idx) => ({
          ...(p.id ? { id: p.id } : {}),
          speciesId: newSpecies.id,
          symptomTh: p.symptomTh,
          causeTh: p.causeTh,
          fixTh: p.fixTh,
          severity: p.severity ?? "medium",
          sortOrder: p.sortOrder !== undefined ? p.sortOrder : idx,
        }))
      );
    } else if (input.copyFromId) {
      const sourceProblems = await db
        .select()
        .from(speciesProblems)
        .where(eq(speciesProblems.speciesId, input.copyFromId));
      if (sourceProblems.length > 0) {
        await db.insert(speciesProblems).values(
          sourceProblems.map((p) => ({
            speciesId: newSpecies.id,
            symptomTh: p.symptomTh,
            causeTh: p.causeTh,
            fixTh: p.fixTh,
            severity: p.severity,
            sortOrder: p.sortOrder,
          }))
        );
      }
    }

    return NextResponse.json({ success: true, data: newSpecies }, { status: 201 });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}

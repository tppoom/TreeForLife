import { getDb } from "@/lib/db";
import { species, speciesMedia, careTemplates, speciesProblems, searchMisses } from "@/db/schema";
import { eq, desc, asc, and, ilike, or, sql } from "drizzle-orm";

export interface SpeciesFilterParams {
  search?: string;
  light?: string;
  waterNeed?: string;
  placement?: string;
  difficulty?: number;
  petSafe?: string;
  matureSize?: string;
  stockStatus?: string;
  sort?: "relevance" | "in_stock_first" | "easiest_first" | "name";
  limit?: number;
}

export async function getAllSpecies(params: SpeciesFilterParams = {}) {
  const db = await getDb();
  const conditions = [];

  // Exclude hidden by default unless explicitly specified
  if (params.stockStatus && params.stockStatus !== "all") {
    conditions.push(eq(species.stockStatus, params.stockStatus));
  } else {
    conditions.push(sql`${species.stockStatus} != 'hidden'`);
  }

  if (params.light) {
    conditions.push(eq(species.light, params.light));
  }

  if (params.waterNeed) {
    conditions.push(eq(species.waterNeed, params.waterNeed));
  }

  if (params.difficulty) {
    conditions.push(eq(species.difficulty, Number(params.difficulty)));
  }

  if (params.petSafe && params.petSafe !== "all") {
    conditions.push(eq(species.petSafe, params.petSafe));
  }

  if (params.matureSize) {
    conditions.push(eq(species.matureSize, params.matureSize));
  }

  // Filter by placement inside JSONB array
  if (params.placement) {
    conditions.push(sql`${species.placement}::jsonb @> ${JSON.stringify([params.placement])}::jsonb`);
  }

  // Search filter
  const searchQuery = params.search?.trim();
  if (searchQuery) {
    const pattern = `%${searchQuery}%`;
    conditions.push(
      or(
        ilike(species.nameTh, pattern),
        ilike(species.nameEn, pattern),
        ilike(species.nameSci, pattern),
        sql`EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(${species.aliases}) AS alias
          WHERE alias ILIKE ${pattern}
        )`
      )
    );
  }

  // Sorting
  let orderByClause = [desc(species.createdAt)];
  if (params.sort === "in_stock_first") {
    orderByClause = [
      sql`CASE WHEN ${species.stockStatus} = 'in_stock' THEN 0 ELSE 1 END`,
      desc(species.updatedAt),
    ];
  } else if (params.sort === "easiest_first") {
    orderByClause = [asc(species.difficulty), desc(species.createdAt)];
  } else if (params.sort === "name") {
    orderByClause = [asc(species.nameTh)];
  }

  const query = db
    .select({
      id: species.id,
      slug: species.slug,
      nameTh: species.nameTh,
      nameEn: species.nameEn,
      nameSci: species.nameSci,
      aliases: species.aliases,
      family: species.family,
      summary: species.summary,
      light: species.light,
      waterNeed: species.waterNeed,
      placement: species.placement,
      difficulty: species.difficulty,
      petSafe: species.petSafe,
      matureSize: species.matureSize,
      matureHeightCm: species.matureHeightCm,
      growthRate: species.growthRate,
      shopNote: species.shopNote,
      stockStatus: species.stockStatus,
      createdAt: species.createdAt,
      updatedAt: species.updatedAt,
    })
    .from(species)
    .where(and(...conditions))
    .orderBy(...orderByClause);

  if (params.limit) {
    query.limit(params.limit);
  }

  const rows = await query;

  // Log search miss if searching returned 0 results
  if (searchQuery && rows.length === 0) {
    await recordSearchMiss(searchQuery);
  }

  // Attach primary images for each species
  const speciesIds = rows.map((r) => r.id);
  if (speciesIds.length === 0) {
    return [];
  }

  const mediaRows = await db
    .select()
    .from(speciesMedia)
    .where(sql`${speciesMedia.speciesId} IN ${speciesIds}`)
    .orderBy(desc(speciesMedia.isPrimary), asc(speciesMedia.sortOrder));

  const mediaMap = new Map<string, typeof mediaRows[0]>();
  for (const m of mediaRows) {
    if (!mediaMap.has(m.speciesId)) {
      mediaMap.set(m.speciesId, m);
    }
  }

  return rows.map((item) => ({
    ...item,
    primaryImage: mediaMap.get(item.id)?.blobUrl || "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80",
    imageAlt: mediaMap.get(item.id)?.altTh || item.nameTh,
  }));
}

// Alias for compatibility
export const getSpeciesList = getAllSpecies;

export async function getSpeciesBySlug(slug: string) {
  const db = await getDb();

  const [item] = await db.select().from(species).where(eq(species.slug, slug)).limit(1);
  if (!item) return null;

  const [media, template, problems] = await Promise.all([
    db.select().from(speciesMedia).where(eq(speciesMedia.speciesId, item.id)).orderBy(desc(speciesMedia.isPrimary), asc(speciesMedia.sortOrder)),
    db.select().from(careTemplates).where(eq(careTemplates.speciesId, item.id)).limit(1),
    db.select().from(speciesProblems).where(eq(speciesProblems.speciesId, item.id)).orderBy(asc(speciesProblems.sortOrder)),
  ]);

  return {
    ...item,
    media,
    careTemplate: template[0] || null,
    problems,
  };
}

export async function getSimilarSpecies(speciesId: string, light: string, waterNeed: string) {
  const db = await getDb();

  const rows = await db
    .select({
      id: species.id,
      slug: species.slug,
      nameTh: species.nameTh,
      nameEn: species.nameEn,
      summary: species.summary,
      difficulty: species.difficulty,
      stockStatus: species.stockStatus,
    })
    .from(species)
    .where(
      and(
        sql`${species.id} != ${speciesId}`,
        sql`${species.stockStatus} != 'hidden'`,
        or(eq(species.light, light), eq(species.waterNeed, waterNeed))
      )
    )
    .limit(4);

  const ids = rows.map((r) => r.id);
  if (ids.length === 0) return [];

  const mediaRows = await db
    .select()
    .from(speciesMedia)
    .where(sql`${speciesMedia.speciesId} IN ${ids}`)
    .orderBy(desc(speciesMedia.isPrimary));

  const mediaMap = new Map<string, string>();
  for (const m of mediaRows) {
    if (!mediaMap.has(m.speciesId)) {
      mediaMap.set(m.speciesId, m.blobUrl);
    }
  }

  return rows.map((r) => ({
    ...r,
    primaryImage: mediaMap.get(r.id) || "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80",
  }));
}

export async function updateStockStatus(id: string, status: "in_stock" | "made_to_order" | "seasonal" | "hidden") {
  const db = await getDb();
  await db.update(species).set({ stockStatus: status, updatedAt: new Date() }).where(eq(species.id, id));
}

export async function recordSearchMiss(rawQuery: string) {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return;

  const db = await getDb();
  await db
    .insert(searchMisses)
    .values({ query, count: 1, lastSeenAt: new Date() })
    .onConflictDoUpdate({
      target: searchMisses.query,
      set: {
        count: sql`${searchMisses.count} + 1`,
        lastSeenAt: new Date(),
      },
    });
}

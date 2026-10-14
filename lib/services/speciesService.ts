import { getDb } from "@/lib/db";
import { species, speciesMedia, careTemplates, speciesProblems, searchMisses } from "@/db/schema";
import { eq, desc, asc, and, ilike, or, sql } from "drizzle-orm";
import { normalizeThaiSearch } from "@/lib/search/normalize";

export interface SpeciesFilterParams {
  search?: string;
  q?: string;
  light?: string;
  waterNeed?: string;
  placement?: string;
  difficulty?: number;
  petSafe?: string;
  matureSize?: string;
  stockStatus?: string;
  sort?: "relevance" | "in_stock_first" | "easiest_first" | "name";
  limit?: number;
  includeDrafts?: boolean;
}

export type SpeciesItem = {
  id: string;
  slug: string;
  nameTh: string;
  nameEn: string;
  nameSci: string;
  aliases: string[];
  family: string;
  summary: string;
  light: string;
  waterNeed: string;
  placement: string[];
  difficulty: number;
  petSafe: string;
  matureSize: string;
  matureHeightCm: number | null;
  growthRate: string;
  shopNote: string;
  stockStatus: string;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  primaryImage: string;
  imageAlt: string;
};

export type SpeciesSearchResult = SpeciesItem[] & {
  didYouMean?: { name: string; slug: string };
};

export async function getAllSpecies(params: SpeciesFilterParams = {}): Promise<SpeciesSearchResult> {
  const db = await getDb();
  const conditions = [];

  // Exclude drafts unless explicitly included
  if (!params.includeDrafts) {
    conditions.push(sql`${species.publishedAt} IS NOT NULL`);
  }

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
  const rawSearchQuery = params.q ?? params.search;
  const searchQuery = rawSearchQuery?.trim();
  const normQ = searchQuery ? normalizeThaiSearch(searchQuery) : "";

  if (searchQuery) {
    if (normQ) {
      conditions.push(
        or(
          ilike(species.searchText, `%${normQ}%`),
          sql`word_similarity(${normQ}, ${species.searchText}) > 0.3`
        )
      );
    } else {
      conditions.push(sql`1=0`);
    }
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
  } else if (normQ) {
    orderByClause = [
      sql`CASE WHEN ${species.searchText} ILIKE ${normQ + "%"} THEN 0 ELSE 1 END`,
      sql`word_similarity(${normQ}, ${species.searchText}) DESC`,
      desc(species.createdAt),
    ];
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
      publishedAt: species.publishedAt,
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

  let didYouMean: { name: string; slug: string } | undefined = undefined;

  // Log search miss and find suggestion if searching returned 0 results
  if (searchQuery && rows.length === 0) {
    if (normQ) {
      const suggestions = await db
        .select({
          nameTh: species.nameTh,
          slug: species.slug,
        })
        .from(species)
        .where(
          and(
            sql`${species.stockStatus} != 'hidden'`,
            sql`${species.publishedAt} IS NOT NULL`,
            sql`word_similarity(${normQ}, ${species.searchText}) BETWEEN 0.2 AND 0.35`
          )
        )
        .orderBy(sql`word_similarity(${normQ}, ${species.searchText}) DESC`)
        .limit(1);

      if (suggestions.length > 0) {
        didYouMean = {
          name: suggestions[0].nameTh,
          slug: suggestions[0].slug,
        };
      }
    }

    await recordSearchMiss(searchQuery, normQ);
  }

  // Attach primary images for each species
  const speciesIds = rows.map((r) => r.id);
  if (speciesIds.length === 0) {
    const emptyResult: SpeciesItem[] = [];
    if (didYouMean) {
      (emptyResult as any).didYouMean = didYouMean;
    }
    return emptyResult as SpeciesSearchResult;
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

  const result: SpeciesItem[] = rows.map((item) => ({
    ...item,
    primaryImage: mediaMap.get(item.id)?.blobUrl || "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80",
    imageAlt: mediaMap.get(item.id)?.altTh || item.nameTh,
  }));

  if (didYouMean) {
    (result as any).didYouMean = didYouMean;
  }

  return result as SpeciesSearchResult;
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

export async function getSpeciesById(id: string) {
  const db = await getDb();

  const [item] = await db.select().from(species).where(eq(species.id, id)).limit(1);
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
        sql`${species.publishedAt} IS NOT NULL`,
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

export async function recordSearchMiss(rawQuery: string, normalizedQuery?: string) {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return;

  const norm = normalizedQuery ?? normalizeThaiSearch(rawQuery);
  const db = await getDb();
  await db
    .insert(searchMisses)
    .values({
      query,
      count: 1,
      normalizedQuery: norm || null,
      lastSeenAt: new Date(),
    })
    .onConflictDoUpdate({
      target: searchMisses.query,
      set: {
        count: sql`${searchMisses.count} + 1`,
        normalizedQuery: norm ? norm : searchMisses.normalizedQuery,
        lastSeenAt: new Date(),
      },
    });
}

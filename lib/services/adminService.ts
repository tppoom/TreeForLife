import { getDb } from "@/lib/db";
import { species, inquiries, searchMisses, userPlants } from "@/db/schema";
import { desc, sql, eq } from "drizzle-orm";
import { getInquiries } from "./inquiryService";

export type StockStatus = "in_stock" | "made_to_order" | "seasonal" | "hidden";

export async function updateStockStatus(
  speciesId: string,
  status: StockStatus
) {
  const db = await getDb();
  const [updated] = await db
    .update(species)
    .set({ stockStatus: status, updatedAt: new Date() })
    .where(eq(species.id, speciesId))
    .returning();

  return updated;
}

export async function getSearchMisses(limit = 50) {
  const db = await getDb();

  const rows = await db
    .select()
    .from(searchMisses)
    .orderBy(desc(searchMisses.count), desc(searchMisses.lastSeenAt))
    .limit(limit);

  return rows;
}

// Alias for compatibility
export const getAdminSearchMisses = getSearchMisses;

export async function getAdminStats() {
  const db = await getDb();

  const [speciesStats] = await db
    .select({
      total: sql<number>`count(*)`,
      inStock: sql<number>`count(*) filter (where ${species.stockStatus} = 'in_stock')`,
      madeToOrder: sql<number>`count(*) filter (where ${species.stockStatus} = 'made_to_order')`,
      seasonal: sql<number>`count(*) filter (where ${species.stockStatus} = 'seasonal')`,
    })
    .from(species);

  const [inquiryStats] = await db
    .select({
      total: sql<number>`count(*)`,
    })
    .from(inquiries);

  const [missStats] = await db
    .select({
      total: sql<number>`count(*)`,
      totalMissedQueries: sql<number>`coalesce(sum(${searchMisses.count}), 0)`,
    })
    .from(searchMisses);

  const [gardenStats] = await db
    .select({
      totalPlants: sql<number>`count(*) filter (where ${userPlants.isActive} = true)`,
    })
    .from(userPlants);

  return {
    species: {
      total: Number(speciesStats?.total || 0),
      inStock: Number(speciesStats?.inStock || 0),
      madeToOrder: Number(speciesStats?.madeToOrder || 0),
      seasonal: Number(speciesStats?.seasonal || 0),
    },
    inquiriesCount: Number(inquiryStats?.total || 0),
    searchMissesCount: Number(missStats?.total || 0),
    totalUserPlants: Number(gardenStats?.totalPlants || 0),
  };
}

export async function getAdminInquiriesList(limit = 50) {
  return getInquiries({ limit });
}

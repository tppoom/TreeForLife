import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzleNodePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";
import { SCHEMA_DDL } from "./schema-ddl";
import { SEED_SPECIES } from "./seed-data";
import path from "path";
import fs from "fs";

export type DbClient =
  | ReturnType<typeof drizzlePglite<typeof schema>>
  | ReturnType<typeof drizzleNodePg<typeof schema>>;

let dbInstance: DbClient | null = null;
let pgliteInstance: PGlite | null = null;
let pgPoolInstance: Pool | null = null;
let isInitialized = false;
let initPromise: Promise<DbClient> | null = null;

interface QueryableClient {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>;
  exec?: (sql: string) => Promise<unknown>;
}

export async function getDb(): Promise<DbClient> {
  if (dbInstance && isInitialized) {
    return dbInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const databaseUrl = process.env.DATABASE_URL;

    if (databaseUrl) {
      if (!pgPoolInstance) {
        pgPoolInstance = new Pool({
          connectionString: databaseUrl,
          ssl: databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1")
            ? false
            : { rejectUnauthorized: false },
        });
      }
      dbInstance = drizzleNodePg(pgPoolInstance, { schema });
      await initDatabase(pgPoolInstance);
    } else {
      const dataDir = path.join(process.cwd(), ".data", "pglite");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (!pgliteInstance) {
        pgliteInstance = new PGlite(dataDir);
        await pgliteInstance.waitReady;
      }

      dbInstance = drizzlePglite(pgliteInstance, { schema });
      await initDatabase(pgliteInstance);
    }

    isInitialized = true;
    return dbInstance;
  })();

  return initPromise;
}

export async function initDatabase(client: QueryableClient) {
  // Execute DDL schema
  if (client.exec) {
    await client.exec(SCHEMA_DDL);
  } else {
    await client.query(SCHEMA_DDL);
  }

  // Check if species exist
  const existingRes = await client.query("SELECT COUNT(*) as count FROM species;");
  const count = Number(existingRes.rows[0]?.count || 0);

  if (count === 0) {
    console.log("Seeding initial 30 curated Thai plant species into TreeForLife database...");

    for (const item of SEED_SPECIES) {
      const speciesRes = await client.query(
        `INSERT INTO species (
          slug, name_th, name_en, name_sci, aliases, family, summary,
          light, water_need, placement, difficulty, pet_safe, mature_size,
          mature_height_cm, growth_rate, soil_mix, fertilizer_note, propagation,
          shop_note, stock_status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
        ) RETURNING id;`,
        [
          item.slug,
          item.nameTh,
          item.nameEn,
          item.nameSci,
          JSON.stringify(item.aliases),
          item.family,
          item.summary,
          item.light,
          item.waterNeed,
          JSON.stringify(item.placement),
          item.difficulty,
          item.petSafe,
          item.matureSize,
          item.matureHeightCm ?? null,
          item.growthRate,
          item.soilMix,
          item.fertilizerNote ?? null,
          item.propagation ?? null,
          item.shopNote,
          item.stockStatus,
        ]
      );

      const speciesId = speciesRes.rows[0]?.id as string | undefined;
      if (!speciesId) continue;

      // Insert media
      for (let i = 0; i < item.images.length; i++) {
        const img = item.images[i];
        await client.query(
          `INSERT INTO species_media (species_id, blob_url, alt_th, sort_order, is_primary, credit)
           VALUES ($1, $2, $3, $4, $5, $6);`,
          [speciesId, img.url, img.altTh, i, img.isPrimary, "ถ่ายที่ร้าน"]
        );
      }

      // Insert care template
      await client.query(
        `INSERT INTO care_templates (
          species_id, water_days_hot, water_days_rainy, water_days_cool,
          fertilize_days, fertilize_pause_months, repot_months, prune_days,
          pest_check_days, notes_th
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
        [
          speciesId,
          item.careTemplate.waterDaysHot,
          item.careTemplate.waterDaysRainy,
          item.careTemplate.waterDaysCool,
          item.careTemplate.fertilizeDays ?? null,
          JSON.stringify(item.careTemplate.fertilizePauseMonths || []),
          item.careTemplate.repotMonths ?? null,
          item.careTemplate.pruneDays ?? null,
          item.careTemplate.pestCheckDays ?? 14,
          item.careTemplate.notesTh ?? null,
        ]
      );

      // Insert problems
      for (let i = 0; i < item.problems.length; i++) {
        const p = item.problems[i];
        await client.query(
          `INSERT INTO species_problems (species_id, symptom_th, cause_th, fix_th, severity, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6);`,
          [speciesId, p.symptomTh, p.causeTh, p.fixTh, p.severity, i]
        );
      }
    }

    // Also seed default staff/admin account
    await client.query(
      `INSERT INTO users (id, display_name, email, role)
       VALUES ('a0000000-0000-0000-0000-000000000001', 'ร้าน TreeForLife (Admin)', 'admin@treeforlife.shop', 'admin')
       ON CONFLICT DO NOTHING;`
    );

    console.log("Database initialized and seeded successfully with 30 species!");
  }
}

// Convenient db export that proxies to initialized instance
export const db = new Proxy({} as DbClient, {
  get(_target, prop) {
    if (!dbInstance) {
      throw new Error("Database not initialized yet. Await getDb() before accessing db properties.");
    }
    return (dbInstance as unknown as Record<string | symbol, unknown>)[prop];
  },
});

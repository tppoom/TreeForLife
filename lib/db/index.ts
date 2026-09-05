import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "@/db/schema";
import { SCHEMA_DDL } from "./schema-ddl";
import { SEED_SPECIES } from "./seed-data";
import path from "path";
import fs from "fs";

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let pgliteInstance: PGlite | null = null;
let isInitialized = false;

export async function getDb() {
  if (dbInstance && isInitialized) {
    return dbInstance;
  }

  // Ensure data directory exists for local persistence
  const dataDir = path.join(process.cwd(), ".data", "pglite");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!pgliteInstance) {
    pgliteInstance = new PGlite(dataDir);
    await pgliteInstance.waitReady;
  }

  dbInstance = drizzle(pgliteInstance, { schema });

  if (!isInitialized) {
    await initDatabase(pgliteInstance);
    isInitialized = true;
  }

  return dbInstance;
}

async function initDatabase(client: PGlite) {
  // Execute DDL schema
  await client.exec(SCHEMA_DDL);

  // Check if species exist
  const existingRes = await client.query<{ count: string | number }>("SELECT COUNT(*) as count FROM species;");
  const count = Number(existingRes.rows[0]?.count || 0);

  if (count === 0) {
    console.log("Seeding initial 30 curated Thai plant species into TreeForLife database...");

    for (const item of SEED_SPECIES) {
      const speciesRes = await client.query<{ id: string }>(
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
          item.matureHeightCm,
          item.growthRate,
          item.soilMix,
          item.fertilizerNote,
          item.propagation,
          item.shopNote,
          item.stockStatus,
        ]
      );

      const speciesId = speciesRes.rows[0]?.id;
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
          item.careTemplate.fertilizeDays,
          JSON.stringify(item.careTemplate.fertilizePauseMonths),
          item.careTemplate.repotMonths,
          item.careTemplate.pruneDays || null,
          item.careTemplate.pestCheckDays,
          item.careTemplate.notesTh,
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

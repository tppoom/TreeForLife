/**
 * TreeForLife - Database Setup & Verification CLI
 * Usage:
 *   npx tsx scripts/db-setup.ts
 *   DATABASE_URL="postgres://..." npx tsx scripts/db-setup.ts
 */

import { existsSync, readFileSync } from "fs";
import { getDb } from "../lib/db/index";
import { sql } from "drizzle-orm";

// Load .env.local if present and DATABASE_URL not already set
if (!process.env.DATABASE_URL && existsSync(".env.local")) {
  const content = readFileSync(".env.local", "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...vals] = trimmed.split("=");
      const val = vals.join("=").trim().replace(/^["']|["']$/g, "");
      if (key.trim() === "DATABASE_URL" && val) {
        process.env.DATABASE_URL = val;
      }
    }
  }
}

async function main() {
  const isCloud = Boolean(process.env.DATABASE_URL);
  console.log("🌿 TreeForLife Database Setup & Verification");
  console.log(`Target: ${isCloud ? "Cloud PostgreSQL (DATABASE_URL)" : "Local Embedded PGlite (.data/pglite)"}`);

  try {
    const db = await getDb();
    
    // Check species count
    const countRes: any = await db.execute(sql`SELECT COUNT(*) as count FROM species;`);
    const count = Number(countRes.rows?.[0]?.count || countRes[0]?.count || 0);

    console.log(`✅ Database connected successfully!`);
    console.log(`🌱 Total species seeded in database: ${count} / 30`);

    if (count < 30) {
      console.warn(`⚠️ Warning: Expected 30 species, found ${count}.`);
    } else {
      console.log(`🎉 Database is 100% ready for production deployment!`);
    }
    process.exit(0);
  } catch (err) {
    console.error(`❌ Database setup failed:`, err);
    process.exit(1);
  }
}

main();

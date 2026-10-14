import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "../lib/db";
import { species } from "../db/schema";
import { sql } from "drizzle-orm";
import { normalizeThaiSearch } from "../lib/search/normalize";

describe("Database Trigram & Search Text Support", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
  });

  it("verifies pg_trgm extension and similarity calculation", async () => {
    const res = await db.execute(
      sql`SELECT similarity(${normalizeThaiSearch("มอนสเตอร่า")}, ${normalizeThaiSearch("มอนสเตอรา")}) AS sim`
    );
    const sim = Number(res[0]?.sim ?? res.rows?.[0]?.sim);
    expect(sim).toBeGreaterThan(0.5);
  });

  it("species table has search_text column populated", async () => {
    const first = await db.query.species.findFirst();
    expect(first).toBeDefined();
    expect(first?.searchText).toBeDefined();
    expect(typeof first?.searchText).toBe("string");
    expect(first?.searchText.length).toBeGreaterThan(0);
  });
});

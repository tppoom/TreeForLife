import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "../lib/db";
import { getAllSpecies } from "../lib/services/speciesService";

describe("Fuzzy Thai Search Integration", () => {
  beforeAll(async () => {
    await getDb();
  });

  it("finds Monstera with typo 'มอนสเตอรา' (missing tone mark)", async () => {
    const results = await getAllSpecies({ q: "มอนสเตอรา" });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].nameTh).toContain("มอนสเตอร่า");
  });

  it("finds Monstera with syllable insertion 'มอนสะเตอร่า'", async () => {
    const results = await getAllSpecies({ q: "มอนสะเตอร่า" });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].nameTh).toContain("มอนสเตอร่า");
  });

  it("finds Snake plant with typo 'ลิ้นมังกอน'", async () => {
    const results = await getAllSpecies({ q: "ลิ้นมังกอน" });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].nameTh).toContain("ลิ้นมังกร");
  });

  it("returns empty array for completely unrelated query", async () => {
    const results = await getAllSpecies({ q: "เครื่องบินโบอิ้ง" });
    expect(results.length).toBe(0);
  });
});

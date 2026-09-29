import { describe, it, expect } from "vitest";
import { normalizeThaiSearch } from "../lib/search/normalize";

describe("Thai Search Text Normalization", () => {
  it("normalizes Thai tone marks and diacritics", () => {
    expect(normalizeThaiSearch("มอนสเตอร่า")).toBe("มอนสเตอรา");
    expect(normalizeThaiSearch("ลิ้นมังกร")).toBe("ลินมังกร");
  });

  it("normalizes middle 'ะ' variations", () => {
    expect(normalizeThaiSearch("มอนสะเตอร่า")).toBe("มอนสเตอรา");
  });

  it("lowercases and strips punctuation, whitespace, and hyphens", () => {
    expect(normalizeThaiSearch("Monstera-Deliciosa (Giant)")).toBe("monsteradeliciosagiant");
  });

  it("preserves Thai vowels including sara u, sara uu, and word-final 'ะ'", () => {
    expect(normalizeThaiSearch("กุหลาบ")).toBe("กุหลาบ");
    expect(normalizeThaiSearch("ชมพู")).toBe("ชมพู");
    expect(normalizeThaiSearch("ซากุระ")).toBe("ซากุระ");
  });

  it("handles empty or single character gracefully", () => {
    expect(normalizeThaiSearch("")).toBe("");
    expect(normalizeThaiSearch("  ")).toBe("");
    expect(normalizeThaiSearch(" ก ")).toBe("ก");
    expect(normalizeThaiSearch(null as unknown as string)).toBe("");
    expect(normalizeThaiSearch(undefined as unknown as string)).toBe("");
  });
});

// lib/search/normalize.ts
export function normalizeThaiSearch(input: string | null | undefined): string {
  if (!input) return "";

  // 1. Unicode NFC normalization & trim
  let text = input.normalize("NFC").trim().toLowerCase();

  // 2. Strip punctuation, whitespace, and symbols
  text = text.replace(/[\s\-_.,/()'"[\]{}:;+!@#$%^&*\\|`~<>?=]/g, "");

  // 3. Remove Thai tone marks and diacritics:
  // U+0E31 (ั mai han-akat), U+0E47-U+0E4E (็ ่ ้ ๊ ๋ ์ ํ), U+0E3A (ฺ phinthu)
  // Note: Keep vowels (ะ า ิ ี ึ ื ุ ู เ แ โ ใ ไ) but handle middle 'ะ'
  text = text.replace(/[\u0E38\u0E39\u0E47-\u0E4E\u0E3A]/g, (match) => {
    // Keep sara u (\u0E38) and sara uu (\u0E39)
    if (match === "\u0E38" || match === "\u0E39") return match;
    return "";
  });
  text = text.replace(/[\u0E48-\u0E4C]/g, ""); // ่ ้ ๊ ๋ ์

  // 4. Remove 'ะ' when in the middle of a Thai word (e.g. มอนสะเตอร่า -> มอนสเตอรา)
  // Matches 'ะ' followed by a Thai consonant (\u0E01-\u0E2E) or leading vowel (\u0E40-\u0E44)
  text = text.replace(/ะ(?=[\u0E01-\u0E2E\u0E40-\u0E44])/g, "");

  return text;
}

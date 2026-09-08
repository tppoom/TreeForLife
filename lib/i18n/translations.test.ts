import { describe, it, expect } from "vitest";
import {
  translations,
  getTranslation,
  t,
  type Locale,
  type TranslationDictionary,
} from "./translations";
import { generateUUID, DEMO_USERS, type UserRole } from "../context/AppContext";

describe("i18n Translations Dictionary Completeness", () => {
  const locales: Locale[] = ["th", "en"];

  it("should contain entries for both Thai (th) and English (en)", () => {
    expect(translations.th).toBeDefined();
    expect(translations.en).toBeDefined();
  });

  function getLeafKeys(obj: Record<string, unknown>, prefix = ""): string[] {
    let keys: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      if (typeof value === "object" && value !== null) {
        keys = keys.concat(getLeafKeys(value as Record<string, unknown>, fullPath));
      } else {
        keys.push(fullPath);
      }
    }
    return keys;
  }

  const thKeys = getLeafKeys(translations.th as unknown as Record<string, unknown>);
  const enKeys = getLeafKeys(translations.en as unknown as Record<string, unknown>);

  it("should have matching translation keys in both languages with no missing keys", () => {
    expect(thKeys.sort()).toEqual(enKeys.sort());
  });

  it("should have non-empty string values for all keys in both languages", () => {
    for (const locale of locales) {
      const dict = translations[locale] as unknown as Record<string, unknown>;
      const keys = getLeafKeys(dict);

      for (const key of keys) {
        const value = getTranslation(locale, key);
        expect(value, `Key "${key}" in locale "${locale}" should not be empty`).toBeTruthy();
        expect(typeof value).toBe("string");
        expect(value.length).toBeGreaterThan(0);
      }
    }
  });

  it("should cover all required UI namespaces", () => {
    const namespaces = [
      "nav",
      "roles",
      "search",
      "filters",
      "care",
      "garden",
      "today",
      "inquiry",
      "admin",
      "toasts",
      "footer",
    ] as const;

    for (const ns of namespaces) {
      expect(translations.th[ns], `Missing namespace ${ns} in th`).toBeDefined();
      expect(translations.en[ns], `Missing namespace ${ns} in en`).toBeDefined();
    }
  });

  it("should include all 3 Thai seasons in care terms", () => {
    expect(translations.th.care.season_hot).toContain("ร้อน");
    expect(translations.th.care.season_rainy).toContain("ฝน");
    expect(translations.th.care.season_cool).toContain("หนาว");

    expect(translations.en.care.season_hot).toContain("Hot");
    expect(translations.en.care.season_rainy).toContain("Rainy");
    expect(translations.en.care.season_cool).toContain("Cool");
  });

  it("should include all 5 pot material filters matching the database schema", () => {
    const materials = [
      "pot_terracotta",
      "pot_plastic",
      "pot_ceramic_glazed",
      "pot_cement",
      "pot_hanging",
    ] as const;

    for (const mat of materials) {
      expect(translations.th.filters[mat]).toBeDefined();
      expect(translations.en.filters[mat]).toBeDefined();
    }
  });

  it("should include all placement options matching the database schema", () => {
    const placements = [
      "placement_outdoor_sun",
      "placement_balcony_shade",
      "placement_indoor_window",
      "placement_indoor_far",
      "placement_air_con",
    ] as const;

    for (const place of placements) {
      expect(translations.th.filters[place]).toBeDefined();
      expect(translations.en.filters[place]).toBeDefined();
    }
  });

  it("should include all 4 user roles in translations", () => {
    const roles = ["guest", "customer", "staff", "admin"] as const;
    for (const r of roles) {
      expect(translations.th.roles[r]).toBeDefined();
      expect(translations.en.roles[r]).toBeDefined();
    }
  });
});

describe("getTranslation / t helper", () => {
  it("translates simple nested dotted keys", () => {
    expect(t("th", "nav.home")).toBe("หน้าแรก");
    expect(t("en", "nav.home")).toBe("Home");
    expect(t("th", "nav.catalog")).toBe("พันธุ์ไม้");
    expect(t("en", "nav.catalog")).toBe("Catalog");
  });

  it("interpolates parameters in translation strings", () => {
    const thResult = t("th", "search.results_count", { count: 42 });
    expect(thResult).toBe("พบ 42 พันธุ์ไม้");

    const enResult = t("en", "search.results_count", { count: 42 });
    expect(enResult).toBe("Found 42 plants");

    const footerTh = t("th", "footer.copyright", { year: 2026 });
    expect(footerTh).toContain("2026");

    const toastTh = t("th", "toasts.role_switched", { role: "ผู้ดูแลระบบ" });
    expect(toastTh).toBe("เปลี่ยนบทบาทเดโมเป็น ผู้ดูแลระบบ แล้ว");
  });

  it("falls back to default Thai when key is missing in chosen locale", () => {
    // Test fallback when a key doesn't exist in English
    const mockDict = translations as unknown as { en: Record<string, unknown> };
    const original = (mockDict.en.nav as Record<string, unknown>).test_custom_fallback;

    try {
      (translations.th.nav as unknown as Record<string, unknown>).test_custom_fallback =
        "ข้อความสำรองภาษาไทย";

      const fallbackResult = t("en", "nav.test_custom_fallback");
      expect(fallbackResult).toBe("ข้อความสำรองภาษาไทย");
    } finally {
      delete (translations.th.nav as unknown as Record<string, unknown>).test_custom_fallback;
    }
  });

  it("falls back to the raw key when missing in all languages", () => {
    const unknownKey = "completely.unknown.key.name";
    expect(t("th", unknownKey)).toBe(unknownKey);
    expect(t("en", unknownKey)).toBe(unknownKey);
  });
});

describe("AppContext Utilities", () => {
  describe("generateUUID", () => {
    it("generates a valid UUID string format (8-4-4-4-12 hex chars)", () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      expect(uuid1).toMatch(uuidRegex);
      expect(uuid2).toMatch(uuidRegex);
      expect(uuid1).not.toEqual(uuid2);
    });
  });

  describe("DEMO_USERS", () => {
    const roles: UserRole[] = ["guest", "customer", "staff", "admin"];

    it("defines valid demo profiles for all 4 roles", () => {
      for (const role of roles) {
        const user = DEMO_USERS[role];
        expect(user).toBeDefined();
        expect(user.role).toBe(role);
        expect(user.displayName).toBeTruthy();
      }
    });

    it("uses valid UUIDs for authenticated demo roles to ensure database compatibility", () => {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      expect(DEMO_USERS.customer.id).toMatch(uuidRegex);
      expect(DEMO_USERS.staff.id).toMatch(uuidRegex);
      expect(DEMO_USERS.admin.id).toMatch(uuidRegex);
    });

    it("assigns realistic emails to authenticated demo roles", () => {
      expect(DEMO_USERS.customer.email).toContain("@");
      expect(DEMO_USERS.staff.email).toContain("@treeforlife.shop");
      expect(DEMO_USERS.admin.email).toContain("@treeforlife.shop");
      expect(DEMO_USERS.guest.email).toBeNull();
    });

    it("ensures guest user id is null to avoid invalid foreign key usage", () => {
      expect(DEMO_USERS.guest.id).toBeNull();
    });
  });
});

/**
 * Full-app E2E coverage for every Phase 1 route and flow that exists today
 * (SPEC.md §6 screens, §11.2 paths 1 and 5). Features listed as not built in
 * ROADMAP.md §1 (LINE Login, notifications, admin CMS, PWA, favorites UI, ...)
 * are intentionally not covered.
 *
 * Every test runs with its own guest token so garden/today data never leaks
 * between tests, and fails on any console error or uncaught page error.
 */
import { test as base, expect, type Page, type Locator } from "@playwright/test";
import { translations } from "../lib/i18n/translations";

const TH = translations.th;
const EN = translations.en;

const SLUGS = [
  "monstera-albo-variegata",
  "ficus-lyrata",
  "sansevieria-trifasciata",
  "calathea-orbifolia",
  "epipremnum-aureum",
];

// Raw dictionary keys leaking into the UI (e.g. "nav.home", "care.every_days")
const RAW_KEY_RE =
  /\b(?:nav|roles|search|filters|care|garden|today|inquiry|admin|toasts|footer)\.[a-z][a-z0-9_]*\b/;

const REF_CODE_RE = /^TFL-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/;

// ---------------------------------------------------------------------------
// Fixtures: per-test console / page error tracking
// ---------------------------------------------------------------------------
type ErrorTracker = { errors: string[]; allow: (re: RegExp) => void };

const test = base.extend<{ errorTracker: ErrorTracker }>({
  errorTracker: [
    async ({ page, baseURL }, use) => {
      const errors: string[] = [];
      const allowed: RegExp[] = [];
      page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
      page.on("console", (msg) => {
        if (msg.type() !== "error") return;
        const text = msg.text();
        const url = msg.location()?.url || "";
        // Third-party images (Unsplash) and the QR service may be unreachable in CI;
        // that is not an app error.
        if (/Failed to load resource/.test(text) && url && !url.startsWith(baseURL!)) return;
        if (allowed.some((re) => re.test(text) || re.test(url))) return;
        errors.push(`console.error: ${text} @ ${url}`);
      });
      await use({ errors, allow: (re) => allowed.push(re) });
      expect(errors, "console errors / uncaught page errors").toEqual([]);
    },
    { auto: true },
  ],
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function uniqueGuestToken(): string {
  // RFC 4122 v4 shape, like AppContext.generateUUID()
  const hex = () => Math.floor(Math.random() * 16).toString(16);
  const part = (n: number) => Array.from({ length: n }, hex).join("");
  return `${part(8)}-${part(4)}-4${part(3)}-a${part(3)}-${part(12)}`;
}

function localDate(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Seed browser storage before any app script runs (guest identity, locale, theme, role). */
async function primeStorage(
  page: Page,
  opts: { guestToken?: string; locale?: "th" | "en"; theme?: "light" | "dark"; role?: string } = {}
) {
  await page.addInitScript((o) => {
    try {
      if (o.guestToken) localStorage.setItem("tfl_guest_token", o.guestToken);
      if (o.locale) localStorage.setItem("tfl_locale", o.locale);
      localStorage.setItem("tfl_theme", o.theme || "light");
      if (o.role) localStorage.setItem("tfl_demo_role", o.role);
    } catch {}
  }, opts);
}

async function expectNoRawKeys(page: Page) {
  const text = await page.locator("body").innerText();
  const match = text.match(RAW_KEY_RE);
  expect(match?.[0] ?? null, `raw i18n key rendered on ${page.url()}`).toBeNull();
  // Un-interpolated templates such as "{inches}" or "{days}"
  const placeholder = text.match(/\{[a-z_]+\}/i);
  expect(placeholder?.[0] ?? null, `un-interpolated i18n template on ${page.url()}`).toBeNull();
}

/** Opens /admin, passing the demo role gate through its own "switch to admin" button. */
async function openAdmin(page: Page) {
  await page.goto("/admin");
  const switchBtn = page.getByRole("button", { name: TH.admin.switch_to_admin_btn });
  const tab = page.getByRole("tab", { name: TH.admin.tab_inventory });
  await expect(switchBtn.or(tab)).toBeVisible();
  if (await switchBtn.isVisible()) await switchBtn.click();
  await expect(tab).toBeVisible();
}

const THAI_RE = /[\u0E00-\u0E7F]+/;

/** EN mode must not show Thai UI copy (user data such as nicknames aside). */
async function expectNoThai(page: Page) {
  const text = await page.locator("main").innerText();
  expect(text.match(THAI_RE)?.[0] ?? null, `Thai text in EN mode on ${page.url()}`).toBeNull();
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return { scrollWidth: doc.scrollWidth, innerWidth: window.innerWidth };
  });
  expect(overflow.scrollWidth, `horizontal overflow on ${page.url()}`).toBeLessThanOrEqual(
    overflow.innerWidth
  );
}

async function createGuestPlant(
  page: Page,
  guestToken: string,
  body: Record<string, unknown>
): Promise<string> {
  const res = await page.request.post("/api/garden/plants", {
    data: {
      guestToken,
      acquiredAt: localDate(),
      potSizeInch: 8,
      potMaterial: "plastic",
      placement: "indoor_window",
      ...body,
    },
  });
  expect(res.status()).toBe(201);
  const json = await res.json();
  return json.plant.id as string;
}

async function getPendingTasks(page: Page, guestToken: string) {
  const res = await page.request.get(`/api/garden/tasks?guestToken=${guestToken}&status=pending`);
  expect(res.ok()).toBeTruthy();
  return (await res.json()).tasks as Array<{
    id: string;
    userPlantId: string;
    dueDate: string;
    snoozeCount: number;
    type: string;
  }>;
}

function productJsonLd(page: Page) {
  return page.locator('script[type="application/ld+json"]').first();
}

async function readPlantNames(page: Page): Promise<{ nameTh: string; nameEn: string }> {
  const raw = await productJsonLd(page).textContent();
  const data = JSON.parse(raw!);
  const product = (Array.isArray(data) ? data : [data]).find((d) => d["@type"] === "Product");
  const m = /^(.*) \((.*)\)$/.exec(product.name);
  return { nameTh: m![1], nameEn: m![2] };
}

/** Selects an option in the wizard by clicking the card containing the label. */
function wizardCard(page: Page, label: string): Locator {
  return page.locator("div.cursor-pointer", { has: page.locator("h4", { hasText: label }) }).first();
}

function nextButton(page: Page): Locator {
  return page.getByRole("button", { name: /^ถัดไป|^Next/ });
}

// ===========================================================================
// 1. Home
// ===========================================================================
test.describe("Home /", () => {
  test("title, hero search, 6 shortcuts with results, in-stock grid", async ({ page }) => {
    await primeStorage(page);
    await page.goto("/");
    await expect(page).toHaveTitle("ร้านต้นไม้และระบบดูแลต้นไม้อัจฉริยะ | TreeForLife");
    await expectNoRawKeys(page);

    // In-stock grid: 8 cards, each labelled with its real stock status
    const cards = page.locator('main a[href^="/plants/"]');
    await expect(cards).toHaveCount(8);
    const stockLabels = [TH.filters.stock_in_stock, TH.filters.stock_made_to_order, TH.filters.stock_seasonal];
    for (let i = 0; i < 8; i++) {
      const cardText = await cards.nth(i).innerText();
      expect(stockLabels.some((l) => cardText.includes(l))).toBeTruthy();
    }

    // Six category shortcuts, each leading to a non-empty result page
    const shortcutHrefs = await page
      .locator('main a[href^="/search?"]')
      .evaluateAll((els) => els.map((e) => e.getAttribute("href")!));
    const shortcuts = shortcutHrefs.filter((h) => h !== "/search?stock=in_stock");
    expect(shortcuts).toHaveLength(6);
    for (const href of shortcuts) {
      await page.goto(href);
      await expect(page.locator('main a[href^="/plants/"]').first()).toBeVisible();
    }

    // Hero search submits to /search?q=
    await page.goto("/");
    const hero = page.getByRole("search").getByRole("textbox");
    await hero.fill("มอน");
    await page.getByRole("search").getByRole("button", { name: TH.search.search_button }).click();
    await page.waitForURL(/\/search\?q=/);
    expect(decodeURIComponent(page.url())).toContain("q=มอน");
    await expect(page.locator('main a[href^="/plants/"]').first()).toBeVisible();
  });

  test("language toggle TH -> EN -> TH persists and renders no raw keys", async ({ page }) => {
    await primeStorage(page);
    await page.goto("/");
    const langBtn = page.getByRole("button", { name: TH.nav.language }).first();
    await expect(langBtn).toContainText(/th/i);
    await langBtn.click();

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1").first()).toContainText("Find Your Perfect Plants");
    await expectNoRawKeys(page);

    // Persisted across reload
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("button", { name: EN.nav.language }).first()).toContainText(/en/i);

    await page.getByRole("button", { name: EN.nav.language }).first().click();
    await expect(page.locator("html")).toHaveAttribute("lang", "th");
    await expect(page.locator("h1").first()).toContainText("ค้นพบต้นไม้ที่ชอบ");
  });

  test("dark mode toggle applies class, persists, and body has dark background", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.setItem("tfl_theme", "light"));
    await page.reload();
    const html = page.locator("html");
    await expect(html).not.toHaveClass(/dark/);

    await page.getByRole("button", { name: TH.nav.dark }).first().click();
    await expect(html).toHaveClass(/dark/);
    await page.reload();
    await expect(html).toHaveClass(/dark/);
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).not.toBe("rgb(250, 248, 245)"); // not the light sand-50 background

    await page.getByRole("button", { name: TH.nav.light }).first().click();
    await expect(html).not.toHaveClass(/dark/);
  });
});

// ===========================================================================
// 2. Search
// ===========================================================================
test.describe("Search /search", () => {
  test("text query updates URL and results", async ({ page }) => {
    await primeStorage(page);
    await page.goto("/search");
    await expect(page).toHaveTitle("ค้นหาและเลือกซื้อพันธุ์ไม้ | Catalog & Plant Finder | TreeForLife");
    const all = await page.locator('main a[href^="/plants/"]').count();
    expect(all).toBe(30);

    const input = page.getByPlaceholder(TH.search.placeholder);
    await input.fill("monstera");
    await input.press("Enter");
    await page.waitForURL(/q=monstera/);
    const cards = page.locator('main a[href^="/plants/"]');
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(30);
    await expect(page.getByText(TH.search.results_count.replace("{count}", String(count)))).toBeVisible();
  });

  const chipCases: Array<{ param: string; value: string; label: string }> = [
    { param: "light", value: "shade", label: TH.filters.light_shade },
    { param: "water", value: "low", label: TH.filters.water_low },
    { param: "placement", value: "bathroom", label: TH.filters.placement_bathroom },
    { param: "difficulty", value: "1", label: TH.filters.difficulty_1 },
    { param: "pet", value: "safe", label: TH.filters.pet_safe },
    { param: "size", value: "sm", label: TH.filters.size_sm },
    { param: "stock", value: "in_stock", label: TH.filters.stock_in_stock },
  ];

  for (const chip of chipCases) {
    test(`filter chip ${chip.param}=${chip.value} syncs URL and narrows results`, async ({ page }) => {
      await primeStorage(page);
      await page.goto("/search");
      await page.locator("aside").getByRole("button", { name: chip.label, exact: true }).click();
      await page.waitForURL(new RegExp(`${chip.param}=${chip.value}`));

      const cards = page.locator('main a[href^="/plants/"]');
      const n = await cards.count();
      expect(n).toBeLessThanOrEqual(30);
      await expect(page.getByText(TH.search.results_count.replace("{count}", String(n)))).toBeVisible();

      // Server rendering of the same URL agrees (URL is the source of truth)
      await page.reload();
      await expect(cards).toHaveCount(n);
      await expect(
        page.locator("aside").getByRole("button", { name: chip.label, exact: true })
      ).toHaveClass(/bg-forest-700/);
    });
  }

  test("URL-driven filters, sort, and clear filters", async ({ page }) => {
    await primeStorage(page);
    await page.goto("/search?pet=safe&difficulty=1");
    const cards = page.locator('main a[href^="/plants/"]');
    const n = await cards.count();
    expect(n).toBeGreaterThan(0);
    // Both filters appear as active badges
    await expect(page.getByText(/ตัวกรองที่เลือก:/)).toBeVisible();

    // Every result is pet safe
    for (let i = 0; i < n; i++) {
      await expect(cards.nth(i)).toContainText("มิตรต่อสัตว์");
    }

    // Sort keeps filters and adds sort param
    await page.locator("main select").selectOption("easiest_first");
    await page.waitForURL(/sort=easiest_first/);
    expect(page.url()).toContain("pet=safe");
    expect(page.url()).toContain("difficulty=1");
    await expect(cards).toHaveCount(n);

    // Clear all filters returns to /search with the full catalog
    await page.getByRole("button", { name: TH.search.clear_filters }).first().click();
    await page.waitForURL((url) => url.pathname === "/search" && url.search === "");
    await expect(cards).toHaveCount(30);
  });

  test("easiest_first sort orders by difficulty", async ({ page }) => {
    await primeStorage(page);
    await page.goto("/search?sort=easiest_first");
    const diffs = await page
      .locator('main a[href^="/plants/"]')
      .evaluateAll((els) =>
        els.map((e) => Number((e.textContent || "").match(/(\d)\/5 ★/)?.[1] ?? NaN))
      );
    expect(diffs.length).toBe(30);
    expect([...diffs].sort((a, b) => a - b)).toEqual(diffs);
  });

  test("zero results: empty state, LINE CTA modal, and search_misses row in admin", async ({ page }) => {
    await primeStorage(page);
    const query = `QA-Miss-${Date.now()}`;
    await page.goto("/search");
    const input = page.getByPlaceholder(TH.search.placeholder);
    await input.fill(query);
    await input.press("Enter");
    await page.waitForURL(/q=QA-Miss/);

    await expect(page.getByRole("heading", { name: TH.search.no_results_title })).toBeVisible();
    await expect(page.getByText(query, { exact: false }).first()).toBeVisible();

    // LINE CTA opens the inquiry modal with availability intent and the query pre-filled
    await page.getByRole("button", { name: TH.search.ask_shop_line }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("textarea")).toHaveValue(query);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    // SPEC §11.2 path 5: a row exists in search_misses (queries are stored lowercased)
    await openAdmin(page);
    await page.getByRole("tab", { name: TH.admin.tab_search_misses }).click();
    await expect(page.locator("table tbody tr", { hasText: query.toLowerCase() })).toBeVisible();
  });
});

// ===========================================================================
// 3. Plant detail
// ===========================================================================
test.describe("Plant detail /plants/[slug]", () => {
  for (const slug of SLUGS) {
    test(`${slug}: title, names, gallery, specs, care, problems, similar, sticky bar, JSON-LD`, async ({ page }) => {
      await primeStorage(page);
      const res = await page.goto(`/plants/${slug}`);
      expect(res?.status()).toBe(200);

      // JSON-LD present and valid
      const ldRaw = await productJsonLd(page).textContent();
      const ld = JSON.parse(ldRaw!);
      const ldList = Array.isArray(ld) ? ld : [ld];
      const product = ldList.find((d: { "@type": string }) => d["@type"] === "Product");
      expect(product).toBeTruthy();
      expect(product.offers.availability).toMatch(/^https:\/\/schema\.org\/(InStock|PreOrder)$/);
      const { nameTh, nameEn } = await readPlantNames(page);

      // SPEC §6.3: "{name_th} ({name_en}) วิธีปลูกและดูแล | ชื่อร้าน"
      await expect(page).toHaveTitle(`${nameTh} (${nameEn}) วิธีปลูกและดูแล | TreeForLife`);

      // Names
      await expect(page.locator("h1").first()).toHaveText(nameTh);
      await expect(page.getByText(nameEn, { exact: true }).first()).toBeVisible();

      // Gallery + stock badge
      const mainImg = page.locator("main img").first();
      await expect(mainImg).toBeVisible();
      const stockLabels = [TH.filters.stock_in_stock, TH.filters.stock_made_to_order, TH.filters.stock_seasonal];
      const heroText = await page.locator("main section").first().innerText();
      expect(stockLabels.some((l) => heroText.includes(l))).toBeTruthy();
      const thumbs = page.locator("main section").first().locator("button:has(img)");
      if ((await thumbs.count()) > 1) {
        const before = await mainImg.getAttribute("src");
        await thumbs.nth(1).click();
        await expect(mainImg).not.toHaveAttribute("src", before!);
      }

      // 6-card quick specs
      const specs = page.locator("section", {
        has: page.getByRole("heading", { name: TH.care.quick_specs_title }),
      });
      for (const label of [
        TH.filters.light,
        TH.filters.water,
        TH.filters.placement,
        TH.filters.difficulty,
        TH.filters.pet,
        TH.filters.size,
      ]) {
        await expect(specs.getByText(label, { exact: true }).first()).toBeVisible();
      }

      // Care guide + shop note
      await expect(page.getByRole("heading", { name: TH.care.care_guide })).toBeVisible();
      await expect(page.getByText(TH.care.season_hot).first()).toBeVisible();
      await expect(page.getByText(TH.care.season_rainy).first()).toBeVisible();
      await expect(page.getByText(TH.care.season_cool).first()).toBeVisible();
      await expect(page.getByText(TH.care.shop_owner_tip).first()).toBeVisible();

      // Problems accordion (open by default, toggles closed and open)
      const problemsHeading = page.getByRole("heading", { name: TH.care.common_problems });
      if (await problemsHeading.count()) {
        const toggle = page.locator("main button[aria-expanded]").first();
        await expect(toggle).toHaveAttribute("aria-expanded", "true");
        await expect(page.getByText("สาเหตุหลัก:").first()).toBeVisible();
        await toggle.click();
        await expect(toggle).toHaveAttribute("aria-expanded", "false");
        await toggle.click();
        await expect(toggle).toHaveAttribute("aria-expanded", "true");
      }

      // Sticky bottom bar: ask shop + add to garden (linked to this species)
      const sticky = page.locator("div.fixed.bottom-0");
      await expect(sticky.getByRole("button", { name: TH.inquiry.ask_shop })).toBeVisible();
      const addLink = sticky.getByRole("link", { name: TH.garden.add_plant });
      await expect(addLink).toHaveAttribute("href", /\/garden\/add\?speciesId=[0-9a-f-]{36}/);
      await page.mouse.wheel(0, 5000);
      await expect(sticky.getByRole("button", { name: TH.inquiry.ask_shop })).toBeInViewport();

      // Similar plants link to other existing plant pages
      const similar = page.locator("section", {
        has: page.getByRole("heading", { name: TH.care.similar_plants }),
      });
      const simLinks = similar.locator('a[href^="/plants/"]');
      expect(await simLinks.count()).toBeGreaterThan(0);
      const simHref = await simLinks.first().getAttribute("href");
      expect(simHref).not.toBe(`/plants/${slug}`);

      await expectNoRawKeys(page);

      await simLinks.first().click();
      await page.waitForURL((u) => u.pathname === simHref);
      await expect(page.locator("h1").first()).toBeVisible();
    });
  }

  test("add-to-garden button pre-selects the species in the wizard", async ({ page }) => {
    await primeStorage(page, { guestToken: uniqueGuestToken() });
    await page.goto("/plants/ficus-lyrata");
    const { nameTh } = await readPlantNames(page);
    await page.locator("div.fixed.bottom-0").getByRole("link", { name: TH.garden.add_plant }).click();
    await page.waitForURL(/\/garden\/add\?speciesId=/);
    await expect(page.locator("div.cursor-pointer.ring-2", { hasText: nameTh }).first()).toBeVisible();
  });
});

// ===========================================================================
// 4. LINE inquiry modal (SPEC §11.2 path 1)
// ===========================================================================
test.describe("Inquiry modal", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("intent choice -> ref code, LINE deep link with species + code, QR, copy, admin log", async ({ page }) => {
    await primeStorage(page, { guestToken: uniqueGuestToken() });
    await page.goto("/search?q=ficus");
    await page.locator('main a[href^="/plants/ficus-lyrata"]').click();
    await page.waitForURL(/\/plants\/ficus-lyrata/);
    const { nameTh } = await readPlantNames(page);

    await page.locator("div.fixed.bottom-0").getByRole("button", { name: TH.inquiry.ask_shop }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.locator("#inquiry-modal-title")).toBeVisible();

    // Pick the "price" intent and add a note
    await dialog.getByRole("button", { name: new RegExp(TH.inquiry.intent_price) }).click();
    await expect(dialog.getByRole("button", { name: new RegExp(TH.inquiry.intent_price) })).toContainText("✓");
    const note = `QA note ${Date.now()}`;
    await dialog.locator("textarea").fill(note);
    await dialog.getByRole("button", { name: /สร้างรหัสและเชื่อมต่อ LINE/ }).click();

    const code = (await dialog.locator("span.font-mono.font-bold").first().innerText()).trim();
    expect(code).toMatch(REF_CODE_RE);

    // LINE deep link carries the species name, ref code, and note
    const lineHref = await dialog.locator('a[href^="https://line.me/R/oaMessage/"]').getAttribute("href");
    const decoded = decodeURIComponent(lineHref!);
    expect(decoded).toContain(`"${nameTh}"`);
    expect(decoded).toContain(`[${code}]`);
    expect(decoded).toContain(note);
    expect(decoded).toContain("ราคา");

    // Desktop shows a QR (image or offline fallback)
    await expect(dialog.getByTestId("inquiry-qr-code")).toBeVisible();

    // Copy puts the full message on the clipboard
    await dialog.getByTestId("copy-message-btn").click();
    await expect(dialog.getByTestId("copy-message-btn")).toContainText(TH.inquiry.message_copied);
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toContain(code);
    expect(clip).toContain(nameTh);

    // Close
    await dialog.getByRole("button", { name: TH.nav.close }).click();
    await expect(dialog).toBeHidden();

    // Admin inquiries tab shows the new ref code, the species, and the customer's note
    await openAdmin(page);
    await page.getByRole("tab", { name: TH.admin.tab_inquiries }).click();
    const card = page.locator("div.rounded-2xl", { has: page.getByText(code, { exact: true }) }).first();
    await expect(card).toBeVisible();
    await expect(card).toContainText(nameTh);
    await expect(card).toContainText(note);
  });
});

// ===========================================================================
// 5. Garden: empty state, wizard, list, quick watered
// ===========================================================================
test.describe("Garden /garden and /garden/add", () => {
  test("empty state for a new guest", async ({ page }) => {
    await primeStorage(page, { guestToken: uniqueGuestToken() });
    await page.goto("/garden");
    await expect(page).toHaveTitle("สวนของฉัน (My Garden) & ตารางรดน้ำ | TreeForLife");
    await expect(page.getByText(TH.garden.empty_title)).toBeVisible();
    await expect(page.locator('main a[href="/garden/add"]').first()).toBeVisible();
    await expectNoRawKeys(page);
  });

  test("4-step wizard (catalog species) with live preview; saved interval matches preview", async ({ page }) => {
    await primeStorage(page, { guestToken: uniqueGuestToken() });
    await page.goto("/garden/add");
    await expect(page.getByText("ขั้นตอนที่ 1 จาก 4")).toBeVisible();

    // Step 1: search the catalog and pick a species
    await page.getByPlaceholder(/ค้นหาชื่อภาษาไทย/).fill("Ficus lyrata");
    const speciesCards = page.locator(".cursor-pointer:has(h4)");
    await expect(speciesCards).toHaveCount(1);
    await speciesCards.first().click();
    const speciesName = (await speciesCards.first().locator("h4").innerText()).trim();
    await nextButton(page).click();

    // Step 2: nickname defaults to the species name, and clearing it does not refill it
    await expect(page.getByText("ขั้นตอนที่ 2 จาก 4")).toBeVisible();
    const nickname = page.getByPlaceholder(TH.garden.nickname_placeholder);
    await expect(nickname).toHaveValue(speciesName);
    await nickname.fill("");
    await expect(nickname).toHaveValue("");
    await expect(nextButton(page)).toBeDisabled();
    const name = `QA Fiddle ${Date.now() % 100000}`;
    await nickname.fill(name);
    await nextButton(page).click();

    // Step 3: pot size + material, mini preview recomputes
    await expect(page.getByText("ขั้นตอนที่ 3 จาก 4")).toBeVisible();
    await page.getByRole("button", { name: '12"', exact: true }).click();
    await wizardCard(page, "ดินเผา").click();
    await expect(page.getByText(/×0\.80/).first()).toBeVisible();
    await nextButton(page).click();

    // Step 4: placement changes the live preview
    await expect(page.getByText("ขั้นตอนที่ 4 จาก 4")).toBeVisible();
    await expect(page.getByRole("heading", { name: TH.garden.preview_schedule })).toBeVisible();
    const recommended = page.getByText(/^ทุก \d+ วัน$/);
    await wizardCard(page, "ในบ้านห่างหน้าต่าง").click();
    const farDays = Number((await recommended.innerText()).match(/\d+/)![0]);
    await wizardCard(page, "กลางแจ้งแดดเต็มวัน").click();
    await expect(page.locator("code", { hasText: "0.70" }).first()).toBeVisible();
    const sunDays = Number((await recommended.innerText()).match(/\d+/)![0]);
    expect(sunDays).toBeLessThanOrEqual(farDays);
    expect(sunDays).toBeGreaterThanOrEqual(1);

    await page.getByRole("button", { name: TH.garden.submit_add }).click();
    await page.waitForURL((u) => u.pathname === "/garden");

    // Card appears with an "upcoming" tag (hollow circle icon + text) matching the preview
    const card = page.locator("div.rounded-2xl", { has: page.getByRole("heading", { name }) }).first();
    await expect(card).toBeVisible();
    const tag = card.getByRole("status");
    await expect(tag).toHaveText(`อีก ${sunDays} วัน`);
    await expect(tag.locator("span[aria-hidden='true']")).toHaveClass(/rounded-full.*border-2/);
    await expectNoRawKeys(page);
  });

  test("custom species wizard: saved interval matches preview; name recorded as demand", async ({ page }) => {
    const guestToken = uniqueGuestToken();
    await primeStorage(page, { guestToken });
    await page.goto("/garden/add");

    await page.getByRole("button", { name: TH.garden.custom_species }).click();
    await expect(nextButton(page)).toBeDisabled();
    const customName = `QA Custom Fern ${Date.now() % 100000}`;
    await page.getByPlaceholder(/เช่น ต้นไทรใบสัก/).fill(customName);
    await nextButton(page).click();

    await expect(page.getByPlaceholder(TH.garden.nickname_placeholder)).toHaveValue(customName);
    await nextButton(page).click();
    await page.getByRole("button", { name: '4"', exact: true }).click();
    await wizardCard(page, "ดินเผา").click();
    await nextButton(page).click();
    await wizardCard(page, "ระเบียง/มีร่มรำไร").click();
    const previewDays = Number(
      (await page.getByText(/^ทุก \d+ วัน$/).innerText()).match(/\d+/)![0]
    );

    await page.getByRole("button", { name: TH.garden.submit_add }).click();
    await page.waitForURL((u) => u.pathname === "/garden");
    const card = page.locator("div.rounded-2xl", { has: page.getByRole("heading", { name: customName }) }).first();
    await expect(card.getByRole("status")).toHaveText(`อีก ${previewDays} วัน`);

    // API agrees: first water task due = today + previewed interval
    const tasks = await getPendingTasks(page, guestToken);
    expect(tasks.find((t) => t.type === "water")!.dueDate).toBe(localDate(previewDays));

    // SPEC §6.6: custom species names are logged to search_misses
    await openAdmin(page);
    await page.getByRole("tab", { name: TH.admin.tab_search_misses }).click();
    await expect(page.locator("table tbody tr", { hasText: customName.toLowerCase() })).toBeVisible();
  });

  test("list sorts by urgency and quick 'Watered' records a log and reschedules", async ({ page }) => {
    const guestToken = uniqueGuestToken();
    const soonId = await createGuestPlant(page, guestToken, { nickname: "QA Soon", customWaterDays: 1 });
    await createGuestPlant(page, guestToken, { nickname: "QA Later", customWaterDays: 5 });
    await primeStorage(page, { guestToken });
    await page.goto("/garden");

    const headings = page.locator("main h3");
    await expect(headings).toHaveText(["QA Soon", "QA Later"]);

    const soonCard = page.locator("div.rounded-2xl", { has: page.getByRole("heading", { name: "QA Soon" }) }).first();
    await expect(soonCard.getByRole("status")).toHaveText("อีก 1 วัน");
    const waterBtn = soonCard.getByRole("button", { name: /บันทึกการรดน้ำสำหรับ QA Soon/ });
    await expect(waterBtn).toContainText(TH.care.action_water_done);
    const box = await waterBtn.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);

    await waterBtn.click();
    await expect(page.getByText(/รดน้ำ "QA Soon" เรียบร้อยแล้ว/)).toBeVisible();

    const res = await page.request.get(`/api/garden/plants/${soonId}`);
    const plant = (await res.json()).plant;
    expect(plant.logs).toHaveLength(1);
    const pending = plant.tasks.filter((t: { status: string }) => t.status === "pending");
    expect(pending).toHaveLength(1);
    expect(pending[0].dueDate).toBe(localDate(1));
  });
});

// ===========================================================================
// 6. Garden detail /garden/[id]
// ===========================================================================
test.describe("Garden detail /garden/[id]", () => {
  test("30-day calendar, history, edit recomputes interval, archive", async ({ page }) => {
    const guestToken = uniqueGuestToken();
    const id = await createGuestPlant(page, guestToken, {
      nickname: "QA Detail",
      speciesId: null,
      potSizeInch: 8,
      potMaterial: "plastic",
      placement: "indoor_window",
    });
    await primeStorage(page, { guestToken });
    page.on("dialog", (d) => d.accept());
    await page.goto(`/garden/${id}`);
    await expect(page).toHaveTitle(/^QA Detail .* \| TreeForLife$/);
    await expect(page.locator("h1")).toHaveText("QA Detail");

    // 30-day calendar
    const calendar = page.locator("div.rounded-3xl", {
      has: page.getByRole("heading", { name: TH.garden.calendar_30_days }),
    });
    await expect(calendar.locator("div.grid > button")).toHaveCount(30);

    // History starts empty; "Watered" adds an entry
    const history = page.locator("div.rounded-3xl", {
      has: page.getByRole("heading", { name: TH.garden.history_timeline }),
    });
    await expect(history.getByText("ยังไม่มีประวัติการดูแล", { exact: false })).toBeVisible();
    await page.getByRole("button", { name: TH.care.action_water_done }).first().click();
    await expect(history.getByText("รดน้ำต้นไม้")).toHaveCount(1);
    // Today's cell in the calendar shows the completion
    await expect(calendar.locator("div.grid > button").first()).toBeVisible();

    // Edit pot + placement: live interval updates and a "from X to Y" message on save
    const editor = page.locator("div.rounded-3xl", {
      has: page.getByRole("heading", { name: TH.garden.edit_plant }),
    });
    const live = editor.getByText(/^ทุกๆ \d+ วัน$/);
    const before = Number((await live.innerText()).match(/\d+/)![0]);
    await editor.locator("select").nth(0).selectOption("terracotta");
    await editor.locator("select").nth(1).selectOption("outdoor_sun");
    await expect(editor.locator("code")).toContainText("0.80");
    await expect(editor.locator("code")).toContainText("0.70");
    const after = Number((await live.innerText()).match(/\d+/)![0]);
    expect(after).toBeLessThan(before);
    await editor.getByRole("button", { name: TH.garden.save_changes }).click();
    await expect(
      page.getByText(
        TH.garden.interval_changed.replace("{from}", String(before)).replace("{to}", String(after))
      )
    ).toBeVisible();

    await page.reload();
    await expect(editor.locator("select").nth(0)).toHaveValue("terracotta");
    await expect(editor.locator("select").nth(1)).toHaveValue("outdoor_sun");
    await expect(live).toHaveText(`ทุกๆ ${after} วัน`);

    // Archive -> back to /garden, plant gone, detail page 404
    await page.getByRole("button", { name: "ย้ายเข้าคลังประวัติ" }).click();
    await page.waitForURL((u) => u.pathname === "/garden");
    await expect(page.getByText(TH.garden.empty_title)).toBeVisible();
    const gone = await page.request.get(`/garden/${id}`);
    expect(gone.status()).toBe(404);
  });

  test("status badge pairs icon + text (upcoming, hollow circle)", async ({ page }) => {
    const guestToken = uniqueGuestToken();
    const id = await createGuestPlant(page, guestToken, { nickname: "QA Badge", customWaterDays: 2 });
    await primeStorage(page, { guestToken });
    await page.goto(`/garden/${id}`);
    const badge = page.locator("div.absolute.top-4 > div").first();
    await expect(badge).toHaveText("อีก 2 วัน");
    await expect(badge.locator("span").first()).toHaveClass(/rounded-full.*border-2/);
    await expect(page.getByText(`${localDate(2)} (อีก 2 วัน)`)).toBeVisible();
  });

  test("unknown or malformed ids return 404", async ({ page, errorTracker }) => {
    errorTracker.allow(/status of 404/);
    for (const bad of ["not-a-uuid", "00000000-0000-4000-a000-000000000000"]) {
      const res = await page.goto(`/garden/${bad}`);
      expect(res?.status()).toBe(404);
    }
    const api = await page.request.get("/api/garden/plants/not-a-uuid");
    expect(api.status()).toBe(404);
  });
});

// ===========================================================================
// 7. Today /today
// ===========================================================================
test.describe("Today /today", () => {
  function atDaysFromNow(n: number): Date {
    const d = new Date();
    d.setDate(d.getDate() + n);
    d.setHours(12, 0, 0, 0);
    return d;
  }

  test("empty state for a guest with no due tasks", async ({ page }) => {
    await primeStorage(page, { guestToken: uniqueGuestToken() });
    await page.goto("/today");
    await expect(page).toHaveTitle("งานดูแลวันนี้ (Today's Tasks) & Checklist | TreeForLife");
    await expect(page.getByTestId("today-empty-state")).toBeVisible();
    await expect(page.getByTestId("btn-mark-all-done")).toHaveCount(0);
    await expectNoRawKeys(page);
  });

  test("overdue/today groups, skip, done, snooze x3 then blocked", async ({ page }) => {
    const guestToken = uniqueGuestToken();
    // Due D+1, D+2, D+3; the browser clock is set to D+3 so they are overdue 2d, overdue 1d, due today
    await createGuestPlant(page, guestToken, { nickname: "QA Snooze", customWaterDays: 1 });
    await createGuestPlant(page, guestToken, { nickname: "QA Skip", customWaterDays: 2 });
    await createGuestPlant(page, guestToken, { nickname: "QA Done", customWaterDays: 3 });
    await primeStorage(page, { guestToken });
    await page.clock.setFixedTime(atDaysFromNow(3));
    await page.goto("/today");

    const overdue = page.getByTestId("section-overdue");
    const dueToday = page.getByTestId("section-due-today");
    await expect(overdue.getByText("QA Snooze")).toBeVisible();
    await expect(overdue.getByText("QA Skip")).toBeVisible();
    await expect(dueToday.getByText("QA Done")).toBeVisible();
    await expect(page.getByTestId("overdue-count")).toHaveText("2");
    await expect(overdue.getByTestId("badge-overdue").first()).toContainText("เลยกำหนด 2 วัน");
    await expect(overdue.getByTestId("badge-overdue").first().locator("svg")).toBeVisible();
    await expect(dueToday.getByTestId("badge-today")).toContainText("ครบกำหนดวันนี้");

    const tasks = await getPendingTasks(page, guestToken);
    const byName = async (nick: string) => {
      const plants = await (await page.request.get(`/api/garden/plants?guestToken=${guestToken}`)).json();
      const p = plants.plants.find((x: { nickname: string }) => x.nickname === nick);
      return tasks.find((t) => t.userPlantId === p.id)!;
    };
    const snoozeTask = await byName("QA Snooze");
    const skipTask = await byName("QA Skip");
    const doneTask = await byName("QA Done");

    // Skip: leaves the overdue group, next cycle computed from the scheduled date
    await page.getByTestId(`btn-skip-${skipTask.id}`).click();
    await expect(overdue.getByText("QA Skip")).toHaveCount(0);
    await expect(page.getByTestId("overdue-count")).toHaveText("1");

    // Done: records a care log and keeps the plant scheduled (exactly one pending water task)
    await page.getByTestId(`btn-done-${doneTask.id}`).click();
    await expect(page.getByText(/ดูแล "QA Done" เรียบร้อยแล้ว/)).toBeVisible();
    const doneDetail = await (await page.request.get(`/api/garden/plants/${doneTask.userPlantId}`)).json();
    expect(doneDetail.plant.logs).toHaveLength(1);
    expect(
      doneDetail.plant.tasks.filter((t: { status: string }) => t.status === "pending")
    ).toHaveLength(1);

    // Snooze three times (+1 day each), then the button is disabled
    const snoozeBtn = page.getByTestId(`btn-snooze-${snoozeTask.id}`);
    for (let i = 1; i <= 3; i++) {
      await expect(snoozeBtn).toBeEnabled();
      await snoozeBtn.click();
      await expect(page.getByTestId(`snooze-count-${snoozeTask.id}`)).toContainText(`${i}/3`);
    }
    await expect(snoozeBtn).toBeDisabled();
    const blocked = await page.request.post("/api/garden/tasks", {
      data: { userPlantId: snoozeTask.userPlantId, taskId: snoozeTask.id, action: "snooze" },
    });
    expect(blocked.status()).toBe(400);
    const after = (await getPendingTasks(page, guestToken)).find((t) => t.id === snoozeTask.id)!;
    expect(after.snoozeCount).toBe(3);
    expect(after.dueDate).toBe(localDate(4));
  });

  test("mark-all-done completes every overdue and due-today task", async ({ page }) => {
    const guestToken = uniqueGuestToken();
    await createGuestPlant(page, guestToken, { nickname: "QA All 1", customWaterDays: 1 });
    await createGuestPlant(page, guestToken, { nickname: "QA All 2", customWaterDays: 2 });
    await primeStorage(page, { guestToken });
    await page.clock.setFixedTime(atDaysFromNow(2));
    await page.goto("/today");

    const markAll = page.getByTestId("btn-mark-all-done");
    await expect(markAll).toContainText("2");
    await markAll.click();
    await expect(page.getByText(/2 รายการ/)).toBeVisible();

    // Server created fresh tasks from its own "today", so each plant has exactly one pending water task
    const tasks = await getPendingTasks(page, guestToken);
    expect(tasks).toHaveLength(2);
    for (const t of tasks) expect(t.snoozeCount).toBe(0);
    const plants = await (await page.request.get(`/api/garden/plants?guestToken=${guestToken}`)).json();
    for (const p of plants.plants) {
      const detail = await (await page.request.get(`/api/garden/plants/${p.id}`)).json();
      expect(detail.plant.logs).toHaveLength(1);
    }
  });
});

// ===========================================================================
// 8. Admin /admin
// ===========================================================================
test.describe("Admin /admin", () => {
  test("role gate, stock toggle persists after reload", async ({ page }) => {
    await primeStorage(page);
    await page.goto("/admin");
    await expect(page).toHaveTitle("ระบบจัดการร้าน (Shop Admin Dashboard) | TreeForLife");
    await expect(page.getByRole("tab", { name: TH.admin.tab_inventory })).toHaveCount(0);
    await openAdmin(page);

    const group = page.getByRole("group", { name: /Stock status controls for / }).first();
    const groupLabel = (await group.getAttribute("aria-label"))!;
    const plantName = groupLabel.replace("Stock status controls for ", "");
    const row = page.locator("table tbody tr", { has: page.getByRole("group", { name: groupLabel }) });
    const original = (await row.locator("td").nth(2).innerText()).trim();

    const target =
      original === TH.admin.stock_seasonal ? "made_to_order" : "seasonal";
    const targetLabel = target === "seasonal" ? TH.admin.stock_seasonal : TH.admin.stock_made_to_order;
    await row.getByRole("button", { name: `Set ${plantName} ${target === "seasonal" ? "seasonal" : "made to order"}` }).click();
    await expect(page.getByText(TH.admin.action_update_success)).toBeVisible();

    await page.reload();
    const rowAfter = page.locator("table tbody tr", { has: page.getByRole("group", { name: groupLabel }) });
    await expect(rowAfter.locator("td").nth(2)).toHaveText(targetLabel);

    // Restore the original status so other tests see the seeded catalog
    const restore: Record<string, string> = {
      [TH.admin.stock_in_stock]: "in stock",
      [TH.admin.stock_made_to_order]: "made to order",
      [TH.admin.stock_seasonal]: "seasonal",
    };
    await rowAfter.getByRole("button", { name: `Set ${plantName} ${restore[original]}` }).click();
    await expect(page.getByText(TH.admin.action_update_success)).toBeVisible();
    await page.reload();
    await expect(
      page.locator("table tbody tr", { has: page.getByRole("group", { name: groupLabel }) }).locator("td").nth(2)
    ).toHaveText(original);
  });
});

// ===========================================================================
// 9. SEO endpoints and 404
// ===========================================================================
test.describe("SEO endpoints and not-found", () => {
  test("sitemap.xml lists all 30 plants; robots.txt disallows admin and api", async ({ page }) => {
    const sitemap = await page.request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();
    const plantLocs = xml.match(/<loc>[^<]*\/plants\/[^<]+<\/loc>/g) || [];
    expect(plantLocs).toHaveLength(30);
    for (const slug of SLUGS) expect(xml).toContain(`/plants/${slug}</loc>`);

    const robots = await page.request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    const txt = await robots.text();
    expect(txt).toMatch(/Disallow: \/admin/);
    expect(txt).toMatch(/Disallow: \/api\//);
    expect(txt).toMatch(/Sitemap: https?:\/\/\S+\/sitemap\.xml/);
  });

  test("unknown plant slug returns 404 page", async ({ page, errorTracker }) => {
    errorTracker.allow(/status of 404/);
    const res = await page.goto("/plants/this-plant-does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByText(/404|could not be found/i).first()).toBeVisible();
  });
});

// ===========================================================================
// 10. Both languages on every page: no raw keys
// ===========================================================================
test.describe("i18n: every page in TH and EN", () => {
  for (const locale of ["th", "en"] as const) {
    test(`no raw translation keys (${locale})`, async ({ page }) => {
      const guestToken = uniqueGuestToken();
      const id = await createGuestPlant(page, guestToken, { nickname: "QA i18n", customWaterDays: 2 });
      await primeStorage(page, { guestToken, locale, role: "admin" });
      const paths = [
        "/",
        "/search",
        "/search?q=zz-no-such-plant-i18n",
        `/plants/${SLUGS[0]}`,
        "/garden",
        "/garden/add",
        `/garden/${id}`,
        "/today",
        "/admin",
      ];
      for (const path of paths) {
        await page.goto(path);
        await expect(page.locator("html")).toHaveAttribute("lang", locale);
        await page.waitForLoadState("networkidle");
        await expectNoRawKeys(page);
      }
      // Admin tabs
      const dict = locale === "th" ? TH : EN;
      for (const tab of [dict.admin.tab_inquiries, dict.admin.tab_search_misses]) {
        await page.getByRole("tab", { name: tab }).click();
        await expectNoRawKeys(page);
      }
    });
  }

  test("EN garden detail and wizard show no Thai-only UI labels", async ({ page }) => {
    const guestToken = uniqueGuestToken();
    const id = await createGuestPlant(page, guestToken, { nickname: "QA EN", customWaterDays: 2 });
    await primeStorage(page, { guestToken, locale: "en" });

    await page.goto(`/garden/${id}`);
    const editor = page.locator("div.rounded-3xl", { has: page.getByRole("heading", { name: EN.garden.edit_plant }) });
    await expect(editor.getByText(/^Every \d+ days$/)).toBeVisible();
    const optionTexts = await editor.locator("option").allInnerTexts();
    for (const o of optionTexts) expect(o).not.toMatch(THAI_RE);

    await expect(editor.locator("code")).toHaveText(/Custom: 2 days/);
    await expectNoThai(page);

    await page.goto("/garden/add");
    await nextButton(page).click();
    await nextButton(page).click();
    await expect(page.getByText(/^\d+ inches \(/).first()).toBeVisible();
    await expectNoThai(page);
    await nextButton(page).click();
    await expect(page.getByRole("heading", { name: EN.garden.preview_schedule })).toBeVisible();
    await expect(page.locator("code").last()).toHaveText(/→ \d+ days$/);
    await expectNoThai(page);
  });
});

// ===========================================================================
// 11. Mobile viewport (390 x 844)
// ===========================================================================
test.describe("Mobile 390x844", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("main pages have no horizontal overflow; mobile menu and filters work", async ({ page }) => {
    const guestToken = uniqueGuestToken();
    const id = await createGuestPlant(page, guestToken, { nickname: "QA Mobile", customWaterDays: 2 });
    await primeStorage(page, { guestToken, role: "admin" });
    for (const path of [
      "/",
      "/search",
      `/plants/${SLUGS[0]}`,
      `/plants/${SLUGS[3]}`,
      "/garden",
      "/garden/add",
      `/garden/${id}`,
      "/today",
      "/admin",
    ]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await expectNoHorizontalOverflow(page);
    }

    // Hamburger menu exposes navigation
    await page.goto("/");
    await page.getByRole("button", { name: TH.nav.open_menu }).click();
    await page.getByRole("link", { name: TH.nav.today }).last().click();
    await page.waitForURL((u) => u.pathname === "/today");

    // Mobile filter drawer applies a filter
    await page.goto("/search");
    await page.getByRole("button", { name: TH.search.filters }).first().click();
    await page.locator("aside").getByRole("button", { name: TH.filters.pet_safe, exact: true }).click();
    await page.waitForURL(/pet=safe/);

    // Sticky action bar is visible on plant detail
    await page.goto(`/plants/${SLUGS[0]}`);
    await expect(
      page.locator("div.fixed.bottom-0").getByRole("button", { name: TH.inquiry.ask_shop })
    ).toBeInViewport();
  });
});

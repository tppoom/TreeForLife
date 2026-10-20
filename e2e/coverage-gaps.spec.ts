/**
 * Coverage for routes and flows that full-app.spec.ts does not reach: curated
 * collections, account/privacy/terms, the demo hub, the species CMS, cron and
 * API robustness. Same rules: every test fails on console or page errors.
 */
import { test as base, expect, type Page } from "@playwright/test";

const RAW_KEY_RE =
  /\b(?:nav|roles|search|filters|care|garden|today|inquiry|admin|toasts|footer|auth|aftercare|supplies)\.[a-z][a-z0-9_]*\b/;
const THAI_RE = /[฀-๿]+/;

const COLLECTIONS = [
  "air-con-plants",
  "pet-safe-plants",
  "beginner-plants",
  "full-sun-plants",
  "bathroom-plants",
  "low-light-plants",
  "desk-plants",
  "balcony-plants",
];

const test = base.extend<{ errors: string[] }>({
  errors: [
    async ({ page, baseURL }, use) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
      page.on("console", (msg) => {
        if (msg.type() !== "error") return;
        const url = msg.location()?.url || "";
        if (/Failed to load resource/.test(msg.text()) && url && !url.startsWith(baseURL!)) return;
        errors.push(`console.error: ${msg.text()} @ ${url}`);
      });
      await use(errors);
      expect(errors, "console errors / uncaught page errors").toEqual([]);
    },
    { auto: true },
  ],
});

function uuid(): string {
  const hex = () => Math.floor(Math.random() * 16).toString(16);
  const part = (n: number) => Array.from({ length: n }, hex).join("");
  return `${part(8)}-${part(4)}-4${part(3)}-a${part(3)}-${part(12)}`;
}

async function prime(page: Page, opts: { locale?: "th" | "en"; role?: string; guestToken?: string } = {}) {
  await page.addInitScript((o) => {
    try {
      localStorage.setItem("tfl_locale", o.locale || "th");
      localStorage.setItem("tfl_theme", "light");
      if (o.role) localStorage.setItem("tfl_demo_role", o.role);
      if (o.guestToken) localStorage.setItem("tfl_guest_token", o.guestToken);
    } catch {}
  }, opts);
}

async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
}

// Known i18n gap: the demo-only Phase 2/3 prototypes and the Thai-staff species CMS
// still hardcode Thai copy, so EN mode is checked for raw keys only on these paths.
const THAI_ONLY_PATHS = [/^\/demo/, /^\/admin\/species/];

async function expectClean(page: Page, locale: "th" | "en") {
  const body = await page.locator("body").innerText();
  expect(body.match(RAW_KEY_RE)?.[0] ?? null, `raw i18n key on ${page.url()}`).toBeNull();
  expect(body.match(/\{[a-z_]+\}/i)?.[0] ?? null, `un-interpolated template on ${page.url()}`).toBeNull();
  if (locale === "en" && !THAI_ONLY_PATHS.some((re) => re.test(new URL(page.url()).pathname))) {
    // Language switchers name Thai in its own script ("ไทย"), which is expected
    const main = (await page.locator("main").innerText()).replaceAll("ไทย", "");
    expect(main.match(THAI_RE)?.[0] ?? null, `Thai text in EN mode on ${page.url()}`).toBeNull();
  }
}

test.describe("Curated collections", () => {
  test("directory lists all 8 collections and each detail page has plants", async ({ page }) => {
    await prime(page);
    await page.goto("/collections");
    for (const slug of COLLECTIONS) {
      await expect(page.locator(`main a[href="/collections/${slug}"]`).first()).toBeVisible();
    }
    for (const slug of COLLECTIONS) {
      const res = await page.goto(`/collections/${slug}`);
      expect(res?.status(), slug).toBe(200);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator('main a[href^="/plants/"]').first(), slug).toBeVisible();
      await expectClean(page, "th");
    }
  });

  test("unknown collection slug is a 404", async ({ request }) => {
    const res = await request.get("/collections/does-not-exist");
    expect(res.status()).toBe(404);
  });
});

for (const locale of ["th", "en"] as const) {
  test.describe(`Static and secondary pages (${locale})`, () => {
    for (const path of ["/collections", "/collections/pet-safe-plants", "/account", "/privacy", "/terms", "/demo"]) {
      test(`${path} renders cleanly`, async ({ page }) => {
        await prime(page, { locale, guestToken: uuid() });
        // A visitor arrives from the app, which records the chosen language in a cookie
        await page.goto("/");
        await settle(page);
        const res = await page.goto(path);
        expect(res?.status()).toBe(200);
        await settle(page);
        await expectClean(page, locale);
      });
    }

    test("admin species CMS pages render cleanly", async ({ page }) => {
      await prime(page, { locale, role: "admin" });
      for (const path of ["/admin/species", "/admin/species/new"]) {
        const res = await page.goto(path);
        expect(res?.status(), path).toBe(200);
        await settle(page);
        await expectClean(page, locale);
      }
    });
  });
}

test.describe("Species CMS round trip", () => {
  test("create draft -> edit -> publish -> public page; hidden from catalog until published", async ({ page }) => {
    await prime(page, { role: "admin" });
    const slug = `qa-e2e-fern-${Date.now()}`;

    const created = await page.request.post("/api/admin/species", {
      data: { nameTh: "เฟิร์น QA", nameEn: "QA Fern", slug },
    });
    expect(created.status()).toBe(201);
    const id = (await created.json()).data.id as string;

    // Draft is not public
    expect((await page.request.get(`/plants/${slug}`)).status()).toBe(404);

    // Edit page loads with the record
    await page.goto(`/admin/species/${id}`);
    await settle(page);
    await expect(page.locator(`input[value="${slug}"]`)).toBeVisible();

    const patched = await page.request.patch(`/api/admin/species/${id}`, {
      data: { summary: "เฟิร์นสำหรับทดสอบ", light: "partial", placement: ["indoor", "bathroom"] },
    });
    expect(patched.status()).toBe(200);

    const published = await page.request.post(`/api/admin/species/${id}/publish`, { data: {} });
    expect(published.ok()).toBeTruthy();

    const res = await page.goto(`/plants/${slug}`);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toContainText("เฟิร์น QA");
    await expectClean(page, "th");

    // Clean up so the local catalog stays at the seeded state
    expect((await page.request.delete(`/api/admin/species/${id}`)).ok()).toBeTruthy();
  });
});

test.describe("API robustness", () => {
  const POST_ENDPOINTS = [
    "/api/garden/plants",
    "/api/garden/tasks",
    "/api/garden/merge",
    "/api/garden/checkins",
    "/api/inquiries",
    "/api/admin/species",
    "/api/notify/subscribe",
    "/api/account/notifications",
  ];

  for (const path of POST_ENDPOINTS) {
    test(`${path} answers malformed JSON with 4xx, not 500`, async ({ request }) => {
      const res = await request.post(path, {
        headers: { "content-type": "application/json", "x-guest-token": uuid() },
        data: "{not json",
      });
      expect(res.status(), path).toBeGreaterThanOrEqual(400);
      expect(res.status(), path).toBeLessThan(500);
    });
  }

  test("another guest's plant is invisible through every plant endpoint", async ({ request }) => {
    const owner = uuid();
    const created = await request.post("/api/garden/plants", {
      headers: { "x-guest-token": owner },
      data: { nickname: "QA Private", potSizeInch: 6, potMaterial: "plastic", placement: "indoor_window" },
    });
    expect(created.status()).toBe(201);
    const id = (await created.json()).plant.id as string;

    const intruder = { "x-guest-token": uuid() };
    expect((await request.get(`/api/garden/plants/${id}`, { headers: intruder })).status()).toBe(404);
    expect(
      (await request.patch(`/api/garden/plants/${id}`, { headers: intruder, data: { nickname: "pwned" } })).status()
    ).toBe(404);
    const list = await (await request.get(`/api/garden/plants`, { headers: intruder })).json();
    expect(list.plants).toHaveLength(0);
  });
});

test.describe("Account (guest)", () => {
  test("export downloads the guest's own garden as JSON", async ({ page }) => {
    const guestToken = uuid();
    await prime(page, { guestToken });
    const created = await page.request.post("/api/garden/plants", {
      headers: { "x-guest-token": guestToken },
      data: { nickname: "QA Export", potSizeInch: 6, potMaterial: "plastic", placement: "indoor_window" },
    });
    expect(created.status()).toBe(201);
    const res = await page.request.get("/api/account/export", { headers: { "x-guest-token": guestToken } });
    expect(res.status()).toBe(200);
    const body = JSON.stringify(await res.json());
    expect(body).toContain("QA Export");
  });
});

test.describe("Guest actions from the browser", () => {
  test("Today buttons work with only the browser's own guest identity", async ({ page }) => {
    const guestToken = uuid();
    await prime(page, { guestToken });
    await page.goto("/garden");
    await settle(page);
    // The page itself must create the plant (no API helper with explicit tokens)
    const res = await page.evaluate(async () => {
      const r = await fetch("/api/garden/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: "QA Cookie", potSizeInch: 6, potMaterial: "plastic", placement: "indoor_window", customWaterDays: 1 }),
      });
      return r.status;
    });
    expect(res).toBe(201);

    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(12, 0, 0, 0);
    await page.clock.setFixedTime(d);
    await page.goto("/today");
    const dueToday = page.getByTestId("section-due-today");
    await expect(dueToday.getByText("QA Cookie")).toBeVisible();
    await dueToday.getByRole("button").filter({ hasText: /ข้าม/ }).first().click();
    await expect(dueToday.getByText("QA Cookie")).toHaveCount(0);
  });
});

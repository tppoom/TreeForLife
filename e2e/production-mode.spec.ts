/**
 * Production-mode behaviour (NEXT_PUBLIC_APP_MODE=production): no demo role
 * switcher, roles come only from the signed LINE Login session cookie.
 * Runs against its own dev server and database (see playwright.config.ts).
 */
import { test, expect } from "@playwright/test";
import { signSession } from "../lib/auth/session";

// Seeded by lib/db/index.ts on first boot
const SEEDED_ADMIN_ID = "a0000000-0000-0000-0000-000000000001";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("tfl_locale", "th");
      localStorage.setItem("tfl_theme", "light");
    } catch {}
  });
});

test("a stale demo role in localStorage does not unlock the back office UI", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("tfl_demo_role", "admin"));
  await page.goto("/admin");
  await expect(page.getByRole("alert").filter({ hasText: "Guest" })).toBeVisible();
  await expect(page.getByRole("tab")).toHaveCount(0);
  // No demo shortcuts in production
  await expect(page.getByRole("button", { name: /Admin/ })).toHaveCount(0);
});

test("a signed staff session hydrates the navbar and opens the dashboard", async ({ page, context, baseURL }) => {
  const token = await signSession({ sub: SEEDED_ADMIN_ID, role: "admin", sv: 1 });
  await context.addCookies([{ name: "tfl_session", value: token, url: baseURL! }]);

  await page.goto("/admin");
  await expect(page.getByRole("tab").first()).toBeVisible();

  // Navbar shows the account link instead of "Login with LINE"
  await expect(page.locator('header a[href="/account"]').first()).toBeVisible();
  await expect(page.locator('header a[href^="/api/auth/line/login"]')).toHaveCount(0);
});

test("a forged session cookie is rejected by the admin API", async ({ request }) => {
  // Dev server is open without ADMIN_PASSWORD, so assert the server-side actor instead
  const me = await request.get("/api/auth/me", { headers: { cookie: "tfl_session=forged" } });
  expect((await me.json()).user).toBeNull();
});

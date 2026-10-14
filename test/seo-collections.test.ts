import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import sitemap from "../app/sitemap";
import { COLLECTIONS } from "../lib/collections";
import { AppProvider } from "../lib/context/AppContext";
import { Navbar } from "../components/layout/Navbar";
import { HomeHero } from "../components/home/HomeHero";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

describe("SEO Collections & Sitemap Integration", () => {
  it("sitemap includes all collection routes", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);

    expect(urls.some((u) => u.endsWith("/collections"))).toBe(true);
    for (const c of COLLECTIONS) {
      expect(urls.some((u) => u.endsWith(`/collections/${c.slug}`)), `Missing ${c.slug}`).toBe(true);
    }
  });

  it("sitemap sets priority 0.8 and weekly frequency for collection pages", async () => {
    const entries = await sitemap();
    const main = entries.find((e) => e.url.endsWith("/collections"));
    expect(main).toBeDefined();
    expect(main?.priority).toBe(0.8);
    expect(main?.changeFrequency).toBe("weekly");

    for (const c of COLLECTIONS) {
      const entry = entries.find((e) => e.url.endsWith(`/collections/${c.slug}`));
      expect(entry, `Entry for ${c.slug} should exist`).toBeDefined();
      expect(entry?.priority).toBe(0.8);
      expect(entry?.changeFrequency).toBe("weekly");
    }
  });

  it("navbar contains collections navigation link in both desktop and mobile menus", () => {
    const html = renderToString(
      React.createElement(AppProvider, null, React.createElement(Navbar))
    );
    expect(html).toContain('href="/collections"');
    expect(html).toContain("คอลเลกชันแนะนำ");
  });

  it("HomeHero shortcut chips link directly to /collections/[slug] routes", () => {
    const html = renderToString(
      React.createElement(AppProvider, null, React.createElement(HomeHero))
    );
    expect(html).toContain('href="/collections/air-con-plants"');
    expect(html).toContain('href="/collections/full-sun-plants"');
    expect(html).toContain('href="/collections/pet-safe-plants"');
    expect(html).toContain('href="/collections/beginner-plants"');
    expect(html).toContain('href="/collections/low-light-plants"');
    expect(html).toContain('href="/collections/desk-plants"');
  });
});

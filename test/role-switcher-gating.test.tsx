import React from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { AppProvider } from "../lib/context/AppContext";
import { Navbar } from "../components/layout/Navbar";
import { AdminDashboardClient } from "../components/admin/AdminDashboardClient";

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

let currentHtml = "";

function render(component: React.ReactElement) {
  currentHtml = renderToString(component);
  return { html: currentHtml };
}

const screen = {
  queryByLabelText(regex: RegExp) {
    const match = currentHtml.match(/aria-label="([^"]*)"/g);
    if (!match) return null;
    const found = match.find((m) => regex.test(m));
    return found ? { textContent: found } : null;
  },
  getByLabelText(regex: RegExp) {
    const res = this.queryByLabelText(regex);
    if (!res) throw new Error(`Element with aria-label matching ${regex} not found`);
    return res;
  },
  queryByText(regex: RegExp) {
    return regex.test(currentHtml) ? { textContent: regex.source } : null;
  },
  getByText(regex: RegExp) {
    const res = this.queryByText(regex);
    if (!res) throw new Error(`Element with text matching ${regex} not found`);
    return res;
  },
  getAllByText(regex: RegExp) {
    const matches = currentHtml.match(
      new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : regex.flags + "g")
    );
    if (!matches || matches.length === 0) {
      throw new Error(`Elements with text matching ${regex} not found`);
    }
    return matches.map((m) => ({ textContent: m }));
  },
};

describe("Navbar Mode Gating", () => {
  const originalEnv = process.env.NEXT_PUBLIC_APP_MODE;

  afterEach(() => {
    process.env.NEXT_PUBLIC_APP_MODE = originalEnv;
  });

  it("does not render Demo Role Switcher in production mode", () => {
    process.env.NEXT_PUBLIC_APP_MODE = "production";
    render(
      <AppProvider>
        <Navbar />
      </AppProvider>
    );

    // Role switcher dropdown label should not be present
    expect(screen.queryByLabelText(/สลับบทบาท/i)).toBeNull();
    expect(screen.queryByText(/Showcase Hub/i)).toBeNull();
  });

  it("renders Demo Role Switcher and Showcase link in demo mode", () => {
    process.env.NEXT_PUBLIC_APP_MODE = "demo";
    render(
      <AppProvider>
        <Navbar />
      </AppProvider>
    );

    // Role switcher dropdown and showcase links should be visible
    expect(screen.getByLabelText(/สลับบทบาท/i)).toBeDefined();
    expect(screen.getAllByText(/Showcase Hub/i).length).toBeGreaterThan(0);
  });
});

describe("AdminDashboardClient Mode Gating", () => {
  const originalEnv = process.env.NEXT_PUBLIC_APP_MODE;

  afterEach(() => {
    process.env.NEXT_PUBLIC_APP_MODE = originalEnv;
  });

  it("does not render demo quick switch controls in production mode for unauthorized users", () => {
    process.env.NEXT_PUBLIC_APP_MODE = "production";
    render(
      <AppProvider>
        <AdminDashboardClient />
      </AppProvider>
    );

    expect(screen.queryByText(/วิธีเข้าถึงหน้าจัดการร้าน/i)).toBeNull();
    expect(screen.queryByText(/สลับเป็น\s*พนักงาน/i)).toBeNull();
    expect(screen.queryByText(/สลับเป็น\s*เจ้าของร้าน/i)).toBeNull();
  });

  it("renders demo quick switch controls in demo mode for unauthorized users", () => {
    process.env.NEXT_PUBLIC_APP_MODE = "demo";
    render(
      <AppProvider>
        <AdminDashboardClient />
      </AppProvider>
    );

    expect(screen.getByText(/วิธีเข้าถึงหน้าจัดการร้าน/i)).toBeDefined();
    expect(screen.getByText(/สลับเป็น\s*พนักงาน/i)).toBeDefined();
    expect(screen.getByText(/สลับเป็น\s*เจ้าของร้าน/i)).toBeDefined();
  });
});

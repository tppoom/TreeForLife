import React from "react";
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { AppProvider } from "../lib/context/AppContext";
import DemoPage from "../app/demo/page";
import { ShowcaseHero } from "../components/demo/ShowcaseHero";

const mockReplace = vi.fn();
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    refresh: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/demo",
}));

let currentHtml = "";

function render(component: React.ReactElement) {
  currentHtml = renderToString(component);
  return { html: currentHtml };
}

const screen = {
  queryByText(regex: RegExp) {
    const decoded = currentHtml.replace(/&amp;/g, "&");
    return regex.test(decoded) ? { textContent: regex.source } : null;
  },
  getByText(regex: RegExp) {
    const res = this.queryByText(regex);
    if (!res) throw new Error(`Element with text matching ${regex} not found`);
    return res;
  },
  getAllByText(regex: RegExp) {
    const decoded = currentHtml.replace(/&amp;/g, "&");
    const matches = decoded.match(
      new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : regex.flags + "g")
    );
    if (!matches || matches.length === 0) {
      throw new Error(`Elements with text matching ${regex} not found`);
    }
    return matches.map((m) => ({ textContent: m }));
  },
};

describe("Demo Page Route Guard & Showcase Hero", () => {
  const originalEnv = process.env.NEXT_PUBLIC_APP_MODE;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(React, "useEffect").mockImplementation((cb) => {
      cb();
    });
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_APP_MODE = originalEnv;
    vi.restoreAllMocks();
  });

  it("renders showcase hero, tabs, and hero text in demo mode", () => {
    process.env.NEXT_PUBLIC_APP_MODE = "demo";
    render(
      <AppProvider>
        <DemoPage />
      </AppProvider>
    );

    // Hero title & subtitle
    expect(screen.getByText(/TreeForLife Experience Hub/i)).toBeDefined();
    expect(screen.getByText(/ภาพรวมโครงการครบทุกเฟส/i)).toBeDefined();
    expect(screen.getByText(/Interactive All-Phases Prototype/i)).toBeDefined();

    // Filter tabs
    expect(screen.getByText(/ทั้งหมด \(All Phases\)/i)).toBeDefined();
    expect(screen.getByText(/Phase 1: ระบบหลัก/i)).toBeDefined();
    expect(screen.getByText(/Phase 2: AI อัจฉริยะ/i)).toBeDefined();
    expect(screen.getByText(/Phase 3: ชุมชน & เติบโต/i)).toBeDefined();

    // Guard should not redirect
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("triggers redirect and does not render showcase in production mode", () => {
    process.env.NEXT_PUBLIC_APP_MODE = "production";
    render(
      <AppProvider>
        <DemoPage />
      </AppProvider>
    );

    // Should trigger router.replace("/")
    expect(mockReplace).toHaveBeenCalledWith("/");

    // Showcase hero should not be visible to unauthorized/production visitors
    expect(screen.queryByText(/TreeForLife Experience Hub/i)).toBeNull();
  });

  it("ShowcaseHero renders correctly with active tab styling", () => {
    render(<ShowcaseHero activeTab="phase2" onTabChange={() => {}} />);

    expect(screen.getByText(/Phase 2: AI อัจฉริยะ/i)).toBeDefined();
    expect(currentHtml).toContain("bg-forest-800 text-sand-50");
  });
});

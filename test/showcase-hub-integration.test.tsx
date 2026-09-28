import React from "react";
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { AppProvider } from "../lib/context/AppContext";
import DemoPage from "../app/demo/page";
import { ShowcaseHubView } from "../components/demo/ShowcaseHubView";

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

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
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
};

describe("Showcase Hub Integration", () => {
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

  it("renders all phases when activeTab is 'all'", () => {
    process.env.NEXT_PUBLIC_APP_MODE = "demo";
    render(
      <AppProvider>
        <ShowcaseHubView initialTab="all" />
      </AppProvider>
    );

    // Phase 1 recap
    expect(screen.getByText(/Phase 1: ระบบหลักที่พร้อมใช้งานจริง/i)).toBeDefined();
    expect(screen.getByText(/คลัง 30 พันธุ์ไม้/i)).toBeDefined();
    expect(screen.getByText(/สวนของฉันและ/i)).toBeDefined();

    // Phase 2 prototypes
    expect(screen.getByText(/Phase 2: ฟีเจอร์ AI อัจฉริยะ/i)).toBeDefined();
    expect(screen.getByText(/หมอต้นไม้/i)).toBeDefined();
    expect(screen.getByText(/ออกแบบมุมสวน/i)).toBeDefined();

    // Phase 3 prototypes
    expect(screen.getByText(/Phase 3: ชุมชนและการเติบโต/i)).toBeDefined();
    expect(screen.getByText(/ขอใบเสนอราคาจัดสวน/i)).toBeDefined();
  });

  it("filters to only Phase 1 when activeTab is 'phase1'", () => {
    process.env.NEXT_PUBLIC_APP_MODE = "demo";
    render(
      <AppProvider>
        <ShowcaseHubView initialTab="phase1" />
      </AppProvider>
    );

    expect(screen.getByText(/Phase 1: ระบบหลักที่พร้อมใช้งานจริง/i)).toBeDefined();
    expect(screen.queryByText(/Phase 2: ฟีเจอร์ AI อัจฉริยะ/i)).toBeNull();
    expect(screen.queryByText(/Phase 3: ชุมชนและการเติบโต/i)).toBeNull();
  });

  it("filters to only Phase 2 when activeTab is 'phase2'", () => {
    process.env.NEXT_PUBLIC_APP_MODE = "demo";
    render(
      <AppProvider>
        <ShowcaseHubView initialTab="phase2" />
      </AppProvider>
    );

    expect(screen.queryByText(/Phase 1: ระบบหลักที่พร้อมใช้งานจริง/i)).toBeNull();
    expect(screen.getByText(/Phase 2: ฟีเจอร์ AI อัจฉริยะ/i)).toBeDefined();
    expect(screen.getByText(/หมอต้นไม้/i)).toBeDefined();
    expect(screen.queryByText(/Phase 3: ชุมชนและการเติบโต/i)).toBeNull();
  });

  it("filters to only Phase 3 when activeTab is 'phase3'", () => {
    process.env.NEXT_PUBLIC_APP_MODE = "demo";
    render(
      <AppProvider>
        <ShowcaseHubView initialTab="phase3" />
      </AppProvider>
    );

    expect(screen.queryByText(/Phase 1: ระบบหลักที่พร้อมใช้งานจริง/i)).toBeNull();
    expect(screen.queryByText(/Phase 2: ฟีเจอร์ AI อัจฉริยะ/i)).toBeNull();
    expect(screen.getByText(/Phase 3: ชุมชนและการเติบโต/i)).toBeDefined();
    expect(screen.getByText(/ขอใบเสนอราคาจัดสวน/i)).toBeDefined();
  });

  it("redirects to '/' and does not render showcase when in production mode", () => {
    process.env.NEXT_PUBLIC_APP_MODE = "production";
    render(
      <AppProvider>
        <DemoPage />
      </AppProvider>
    );

    expect(mockReplace).toHaveBeenCalledWith("/");
    expect(screen.queryByText(/TreeForLife Experience Hub/i)).toBeNull();
  });
});

import React from "react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderToString } from "react-dom/server";
import { PlantDoctorPrototype } from "../components/demo/PlantDoctorPrototype";
import { BudgetRecommenderPrototype } from "../components/demo/BudgetRecommenderPrototype";
import { GardenDesignerPrototype } from "../components/demo/GardenDesignerPrototype";
import { AssistantChatPrototype } from "../components/demo/AssistantChatPrototype";

// React 19 internal dispatcher hook support for headless Node execution
const internals =
  (React as any).__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE ||
  (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

let hookIndex = 0;
let stateStore: any[] = [];
let currentComponent: any = null;
let currentProps: any = null;
let currentHtml = "";
let currentTree: any = null;

const mockDispatcher = {
  useState(initial: any) {
    const idx = hookIndex++;
    if (stateStore[idx] === undefined) {
      stateStore[idx] = typeof initial === "function" ? initial() : initial;
    }
    const setState = (next: any) => {
      stateStore[idx] = typeof next === "function" ? next(stateStore[idx]) : next;
      reRender();
    };
    return [stateStore[idx], setState];
  },
  useEffect() {},
  useCallback(fn: any) {
    return fn;
  },
  useMemo(fn: any) {
    return fn();
  },
  useRef(initial: any) {
    return { current: initial };
  },
};

function reRender() {
  if (!currentComponent) return;
  internals.H = mockDispatcher;
  hookIndex = 0;
  currentTree = currentComponent(currentProps || {});
  currentHtml = renderToString(currentTree);
}

function render(el: React.ReactElement) {
  stateStore = [];
  hookIndex = 0;
  currentComponent = el.type;
  currentProps = el.props;
  reRender();
  return { html: currentHtml };
}

function extractText(node: any): string {
  if (!node) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (node.props && node.props.children) {
    const ch = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
    return ch.map(extractText).join(" ");
  }
  return "";
}

function findNode(node: any, pred: (n: any) => boolean): any {
  if (!node) return null;
  // Search deeper children first so specific elements (e.g. button) match instead of parent containers
  if (node.props && node.props.children) {
    const ch = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
    for (const c of ch) {
      const res = findNode(c, pred);
      if (res) return res;
    }
  }
  if (pred(node)) return node;
  return null;
}

const screen = {
  getByText(matcher: string | RegExp) {
    const regex = typeof matcher === "string" ? new RegExp(matcher) : matcher;
    const decoded = currentHtml.replace(/&amp;/g, "&");
    if (regex.test(decoded)) {
      return { textContent: regex.source };
    }
    throw new Error(
      `Element with text matching ${matcher} not found in HTML:\n${currentHtml.slice(0, 300)}...`
    );
  },
  queryByText(matcher: string | RegExp) {
    const regex = typeof matcher === "string" ? new RegExp(matcher) : matcher;
    const decoded = currentHtml.replace(/&amp;/g, "&");
    return regex.test(decoded) ? { textContent: regex.source } : null;
  },
  getByRole(role: string, options: { name?: string | RegExp } = {}) {
    const match = findNode(currentTree, (node) => {
      const nodeRole =
        node.props?.role ||
        (node.type === "button"
          ? "button"
          : node.type === "input" && node.props?.type === "range"
          ? "slider"
          : null);
      if (nodeRole !== role) return false;
      if (options.name) {
        const text = extractText(node);
        const nameRegex =
          typeof options.name === "string" ? new RegExp(options.name) : options.name;
        return nameRegex.test(text);
      }
      return true;
    });
    if (!match) {
      throw new Error(`Element with role "${role}" and name "${options.name}" not found`);
    }
    return match;
  },
};

const fireEvent = {
  click(node: any) {
    if (node.props && node.props.onClick) {
      node.props.onClick({ preventDefault: () => {} });
    }
  },
  change(node: any, event: { target: { value: any } }) {
    if (node.props && node.props.onChange) {
      node.props.onChange(event);
    }
  },
};

async function waitFor(cb: () => void, { timeout = 1000, interval = 10 } = {}) {
  const start = Date.now();
  while (true) {
    try {
      return cb();
    } catch (e) {
      if (Date.now() - start > timeout) throw e;
      await new Promise((r) => setTimeout(r, interval));
    }
  }
}

describe("Phase 2 AI Prototypes", () => {
  let prevDispatcher: any;

  beforeEach(() => {
    stateStore = [];
    hookIndex = 0;
    prevDispatcher = internals.H;
    internals.H = mockDispatcher;
  });

  afterEach(() => {
    internals.H = prevDispatcher;
  });

  it("Plant Doctor diagnoses preset leaf problems", async () => {
    render(<PlantDoctorPrototype scanDurationMs={20} />);
    expect(screen.getByText(/หมอต้นไม้/i)).toBeDefined();

    const diagnoseBtn = screen.getByRole("button", { name: /วิเคราะห์อาการ/i });
    fireEvent.click(diagnoseBtn);

    // Should display diagnosis result card after analysis
    await waitFor(() => {
      expect(screen.getByText(/ผลการวินิจฉัย/i)).toBeDefined();
    });

    // Check cause, severity, action plan, and remedy
    expect(screen.getByText(/ระดับความรุนแรง/i)).toBeDefined();
    expect(screen.getByText(/แนวทางแก้ไข/i)).toBeDefined();
    expect(screen.getByText(/สูตรธรรมชาติ/i)).toBeDefined();
  });

  it("Budget Recommender calculates curated bundle according to budget slider", () => {
    render(<BudgetRecommenderPrototype />);
    expect(screen.getByText(/โหมดงบเท่านี้/i)).toBeDefined();

    // Budget slider should be present and have default value
    const slider = screen.getByRole("slider");
    expect(slider).toBeDefined();
    expect(screen.getByText(/รวมงบประมาณ/i)).toBeDefined();

    // Change budget slider value
    fireEvent.change(slider, { target: { value: "3000" } });
    expect(screen.getByText(/3,000/i)).toBeDefined();
  });

  it("Garden Designer switches spaces and species with suitability metrics", () => {
    render(<GardenDesignerPrototype />);
    expect(screen.getByText(/ออกแบบมุมสวน/i)).toBeDefined();
    expect(screen.getByText(/มุมห้องนั่งเล่นข้างโซฟา/i)).toBeDefined();
    expect(screen.getByText(/ระเบียงรับแดดบ่าย/i)).toBeDefined();

    // Environmental suitability card displays light match and pot recommendation
    expect(screen.getByText(/ความเหมาะสมของแสง/i)).toBeDefined();
    expect(screen.getByText(/ขนาดกระถางแนะนำ/i)).toBeDefined();
  });

  it("Assistant Chat simulator provides quick prompt chips and realistic botanical answers", () => {
    render(<AssistantChatPrototype />);
    expect(screen.getByText(/ผู้ช่วยตอบคำถาม 24 ชม\./i)).toBeDefined();

    // Quick prompt chips
    const chip = screen.getByRole("button", { name: /ห้องนอนเปิดแอร์ทั้งคืน/i });
    expect(chip).toBeDefined();

    // Clicking prompt populates answer
    fireEvent.click(chip);
    expect(screen.getByText(/ลิ้นมังกร|Sansevieria/i)).toBeDefined();
  });
});

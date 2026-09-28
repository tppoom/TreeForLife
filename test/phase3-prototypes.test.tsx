import React from "react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderToString } from "react-dom/server";
import { QuoteRequestPrototype } from "../components/demo/QuoteRequestPrototype";
import { CommunityBoardPrototype } from "../components/demo/CommunityBoardPrototype";
import { MemberPointsPrototype } from "../components/demo/MemberPointsPrototype";
import { ShopAnalyticsPrototype } from "../components/demo/ShopAnalyticsPrototype";

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
    const decoded = currentHtml.replace(/&amp;/g, "&").replace(/<!--.*?-->/g, "");
    if (regex.test(decoded)) {
      return { textContent: regex.source };
    }
    throw new Error(
      `Element with text matching ${matcher} not found in HTML:\n${currentHtml.slice(0, 300)}...`
    );
  },
  queryByText(matcher: string | RegExp) {
    const regex = typeof matcher === "string" ? new RegExp(matcher) : matcher;
    const decoded = currentHtml.replace(/&amp;/g, "&").replace(/<!--.*?-->/g, "");
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
          : node.type === "input"
          ? "textbox"
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

describe("Phase 3 Platform Prototypes", () => {
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

  it("Quote Request generates preliminary estimate with cost breakdown and LINE simulator", () => {
    render(<QuoteRequestPrototype />);
    expect(screen.getByText(/ขอใบเสนอราคาจัดสวน/i)).toBeDefined();

    const generateBtn = screen.getByRole("button", { name: /ประเมินราคา/i });
    fireEvent.click(generateBtn);

    expect(screen.getByText(/ใบเสนอราคาเบื้องต้น/i)).toBeDefined();
    expect(screen.getByText(/ค่าพันธุ์ไม้/i)).toBeDefined();
    expect(screen.getByText(/ค่าปรับหน้าดิน\/วัสดุปลูก/i)).toBeDefined();
    expect(screen.getByText(/ค่าแรงและติดตั้ง/i)).toBeDefined();
    expect(screen.getByText(/การรับประกันดูแล 30 วัน/i)).toBeDefined();
    expect(screen.getByText(/LINE/i)).toBeDefined();
  });

  it("Community Board prototype supports likes and comment posting", () => {
    render(<CommunityBoardPrototype />);
    expect(screen.getByText(/ชุมชนคนรักต้นไม้/i)).toBeDefined();
    expect(screen.getByText(/บันทึกการเติบโต/i)).toBeDefined();

    // Check for member posts
    expect(screen.getByText(/มอนสเตอร่า/i)).toBeDefined();

    // Test like button
    const likeBtn = screen.getByRole("button", { name: /กดไลก์/i });
    expect(likeBtn).toBeDefined();
    fireEvent.click(likeBtn);

    // Test comment post
    const commentInput = screen.getByRole("textbox");
    fireEvent.change(commentInput, { target: { value: "ต้นไม้สวยมากครับ ปลูกเก่งมาก" } });
    const postBtn = screen.getByRole("button", { name: /ส่งความคิดเห็น|โพสต์/i });
    fireEvent.click(postBtn);

    expect(screen.getByText(/ต้นไม้สวยมากครับ ปลูกเก่งมาก/i)).toBeDefined();
  });

  it("Member Points prototype shows loyalty streak, balance, and redeemable rewards", () => {
    render(<MemberPointsPrototype />);
    expect(screen.getByText(/แต้มสะสม/i)).toBeDefined();
    expect(screen.getByText(/350 แต้ม/i)).toBeDefined();
    expect(screen.getByText(/ของรางวัลที่แลกได้/i)).toBeDefined();
    expect(screen.getByText(/14 วัน/i)).toBeDefined();

    // Rewards listed
    expect(screen.getByText(/กระถางดินเผาแฮนด์เมด 6 นิ้ว/i)).toBeDefined();
    expect(screen.getByText(/ชุดปุ๋ยออร์แกนิคบำรุงใบ/i)).toBeDefined();
    expect(screen.getByText(/คูปองส่วนลด 15%/i)).toBeDefined();

    // Redeem action
    const redeemBtn = screen.getByRole("button", { name: /แลกรับรางวัล/i });
    fireEvent.click(redeemBtn);

    // Points should decrease (350 - 150 = 200)
    expect(screen.getByText(/200 แต้ม/i)).toBeDefined();
    expect(screen.getByText(/แลกรับสำเร็จ/i)).toBeDefined();
  });

  it("Shop Analytics prototype visualizes top trending plants and search misses table", () => {
    render(<ShopAnalyticsPrototype />);
    expect(screen.getByText(/สถิติร้านค้า/i)).toBeDefined();
    expect(screen.getByText(/สินค้าที่ลูกค้าค้นหา/i)).toBeDefined();

    // Top trending plants
    expect(screen.getByText(/Top 5 พันธุ์ไม้ยอดนิยม/i)).toBeDefined();
    expect(screen.getByText(/มอนสเตอร่าไจแอนท์/i)).toBeDefined();

    // Search misses table
    expect(screen.getByText(/คำค้นหายอดนิยมที่ยังไม่มีในสต็อก/i)).toBeDefined();
    expect(screen.getByText(/หน้าวัวใบเงิน/i)).toBeDefined();
    expect(screen.getByText(/มอนสเตอร่าอัลโบด่าง/i)).toBeDefined();
  });
});

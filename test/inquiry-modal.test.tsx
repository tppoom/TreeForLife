import { describe, it, expect, beforeAll } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { getDb } from "@/lib/db";
import {
  createInquiry,
  getInquiries,
  generateRefCode,
  formatLineMessage,
  getLineDeepLink,
  getLineAddFriendUrl,
  type InquiryIntent,
} from "@/lib/services/inquiryService";
import { POST as postInquiryRoute, GET as getInquiryRoute } from "@/app/api/inquiries/route";
import { InquiryModal, type InquiryModalProps } from "@/components/ui/InquiryModal";
import { LineInquiryModal } from "@/components/inquiry/LineInquiryModal";
import { triggerInquiry } from "@/components/layout/Navbar";
import { AppContextProvider } from "@/lib/context/AppContext";

describe("Task 7: LINE Inquiry Modal & Handoff Integration", () => {
  beforeAll(async () => {
    await getDb();
  });

  describe("1. Inquiry Service & Reference Code Generation", () => {
    it("generateRefCode returns valid TFL-XXXX pattern without ambiguous characters", () => {
      for (let i = 0; i < 50; i++) {
        const code = generateRefCode();
        expect(code).toMatch(/^TFL-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/);
        expect(code).not.toMatch(/[01OI]/);
      }
    });

    it("formatLineMessage formats appropriate Thai text for all 4 intents", () => {
      const intents: InquiryIntent[] = ["price", "availability", "care_help", "design_quote"];

      for (const intent of intents) {
        const msg = formatLineMessage(intent, "มอนสเตอร่า ด่าง", "TFL-9A3K", "มีบริการส่งไหม");
        expect(msg).toContain("TFL-9A3K");
        expect(msg).toContain("มีบริการส่งไหม");

        if (intent === "price") {
          expect(msg).toContain("มอนสเตอร่า ด่าง");
          expect(msg).toContain("ขอทราบราคาและขนาด");
        } else if (intent === "availability") {
          expect(msg).toContain("มอนสเตอร่า ด่าง");
          expect(msg).toContain("มีของพร้อมส่งไหม");
        } else if (intent === "care_help") {
          expect(msg).toContain("มอนสเตอร่า ด่าง");
          expect(msg).toContain("ขอคำแนะนำเรื่องการดูแล");
        } else if (intent === "design_quote") {
          expect(msg).toContain("สนใจปรึกษาจัดมุมต้นไม้");
        }
      }
    });

    it("getLineDeepLink generates valid LINE OA deep link", () => {
      const deepLink = getLineDeepLink("สวัสดี TreeForLife [TFL-1234]", "treeforlife");
      expect(deepLink).toContain("https://line.me/R/oaMessage/@treeforlife/?");
      expect(deepLink).toContain(encodeURIComponent("สวัสดี TreeForLife [TFL-1234]"));
    });

    it("getLineAddFriendUrl returns valid LINE OA profile link", () => {
      const addUrl = getLineAddFriendUrl("treeforlife");
      expect(addUrl).toBe("https://line.me/R/ti/p/@treeforlife");
    });

    it("createInquiry returns both message and messageText for spec compatibility", async () => {
      const res = await createInquiry({
        sourcePage: "/plants/monstera-deliciosa",
        intent: "care_help",
        speciesNameTh: "มอนสเตอร่า เดลิซิโอซา",
        customNote: "ใบเหลืองแก้ยังไง",
      });

      expect(res.refCode).toMatch(/^TFL-/);
      expect(res.message).toBeDefined();
      expect(res.messageText).toBe(res.message);
      expect(res.lineUrl).toContain("https://line.me/R/oaMessage/");
      expect(res.lineOaId).toBe("treeforlife");
    });
  });

  describe("2. REST API /api/inquiries", () => {
    it("POST /api/inquiries creates inquiry record and returns refCode, lineUrl, messageText", async () => {
      const testGuestToken = `guest-test-${Date.now()}`;
      const req = new Request("http://localhost/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourcePage: "/plants/fiddle-leaf-fig",
          intent: "price",
          speciesNameTh: "ไทรใบสัก",
          guestToken: testGuestToken,
          customNote: "กระถาง 12 นิ้ว",
        }),
      });

      const res = await postInquiryRoute(req);
      expect(res.status).toBe(201);
      const data = await res.json();

      expect(data.refCode).toMatch(/^TFL-/);
      expect(data.lineUrl).toContain("https://line.me/R/oaMessage/@treeforlife/?");
      expect(data.messageText).toBeDefined();
      expect(data.messageText).toContain("ไทรใบสัก");
      expect(data.messageText).toContain("กระถาง 12 นิ้ว");
      expect(data.messageText).toContain(data.refCode);

      // Verify retrieval via GET
      const getReq = new Request(`http://localhost/api/inquiries?refCode=${data.refCode}`);
      const getRes = await getInquiryRoute(getReq);
      expect(getRes.status).toBe(200);
      const getData = await getRes.json();
      expect(getData.inquiries.length).toBe(1);
      expect(getData.inquiries[0].refCode).toBe(data.refCode);
      expect(getData.inquiries[0].intent).toBe("price");
    });

    it("POST /api/inquiries rejects requests missing required fields", async () => {
      const req = new Request("http://localhost/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourcePage: "",
        }),
      });

      const res = await postInquiryRoute(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Missing required fields");
    });
  });

  describe("3. InquiryModal Component Rendering & Props", () => {
    it("renders nothing when isOpen is false", () => {
      const html = renderToString(
        <AppContextProvider>
          <InquiryModal isOpen={false} onClose={() => {}} />
        </AppContextProvider>
      );
      expect(html).toBe("");
    });

    it("renders modal dialog, all 4 intent buttons, and custom note textarea when isOpen is true", () => {
      const html = renderToString(
        <AppContextProvider>
          <InquiryModal
            isOpen={true}
            onClose={() => {}}
            sourcePage="/search"
            defaultIntent="availability"
          />
        </AppContextProvider>
      );

      // Dialog container & title
      expect(html).toContain('role="dialog"');
      expect(html).toContain('aria-modal="true"');
      expect(html).toContain("inquiry-modal-title");

      // Intent options
      expect(html).toContain("สอบถามว่ามีของหรือไม่");
      expect(html).toContain("สอบถามราคาและขนาดที่มี");
      expect(html).toContain("ปรึกษาอาการและวิธีดูแล");
      expect(html).toContain("ขอใบเสนอราคาจัดมุมต้นไม้");

      // Note textarea and CTA button
      expect(html).toContain("<textarea");
      expect(html).toContain("สร้างรหัสและเชื่อมต่อ LINE");

      // Close button with >= 44x44px touch target
      expect(html).toContain("min-w-[44px]");
      expect(html).toContain("min-h-[44px]");
    });

    it("renders species information when species prop is provided", () => {
      const mockSpecies = {
        id: "spec-12345",
        nameTh: "ยางอินเดียดำ",
        nameEn: "Rubber Tree Burgundy",
        slug: "ficus-elastica-burgundy",
      };

      const html = renderToString(
        <AppContextProvider>
          <InquiryModal
            isOpen={true}
            onClose={() => {}}
            species={mockSpecies}
            defaultIntent="care_help"
          />
        </AppContextProvider>
      );

      expect(html).toContain("ยางอินเดียดำ");
      expect(html).toContain("Rubber Tree Burgundy");
      expect(html).toContain("TreeForLife");
    });

    it("supports backward-compatible speciesId and speciesNameTh props", () => {
      const html = renderToString(
        <AppContextProvider>
          <InquiryModal
            isOpen={true}
            onClose={() => {}}
            speciesId="legacy-id-99"
            speciesNameTh="กวักมรกตด่าง"
            sourcePage="/plants/zamioculcas-zamiifolia-variegated"
          />
        </AppContextProvider>
      );

      expect(html).toContain("กวักมรกตด่าง");
    });

    it("LineInquiryModal re-exports InquiryModal for seamless compatibility", () => {
      expect(LineInquiryModal).toBe(InquiryModal);

      const html = renderToString(
        <AppContextProvider>
          <LineInquiryModal
            isOpen={true}
            onClose={() => {}}
            speciesNameTh="มอนสเตอร่า"
            sourcePage="/search"
            initialQuery="มอนสเตอร่า"
          />
        </AppContextProvider>
      );

      expect(html).toContain("TreeForLife");
      expect(html).toContain("มอนสเตอร่า");
    });
  });

  describe("4. Header & Global Handoff Integration", () => {
    it("triggerInquiry function exists and can be dispatched without error", () => {
      expect(typeof triggerInquiry).toBe("function");
      // In node environment without window, function should safely no-op
      expect(() =>
        triggerInquiry({
          species: {
            id: "sp-test",
            nameTh: "ต้นไม้ทดสอบ",
            nameEn: "Test Plant",
          },
          intent: "price",
        })
      ).not.toThrow();
    });
  });
});

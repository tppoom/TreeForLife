import { describe, it, expect, beforeAll } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { getDb } from "../lib/db";
import { GET as exportData } from "../app/api/account/export/route";
import { POST as deleteData } from "../app/api/account/delete/route";
import { POST as postPlant } from "../app/api/garden/plants/route";
import { GardenPdpaSection, GardenPlantsClient } from "../components/garden/GardenPlantsClient";
import { AppContextProvider } from "../lib/context/AppContext";

describe("PDPA Data Rights (Export & Erasure)", () => {
  let guestToken: string;
  let testSpeciesId: string;

  beforeAll(async () => {
    const db = await getDb();
    guestToken = `guest-pdpa-${Date.now()}`;
    const res = await db.query.species.findFirst();
    if (!res) throw new Error("Seed species required for test");
    testSpeciesId = res.id;

    // Create a plant
    await postPlant(
      new Request("https://example.com/api/garden/plants", {
        method: "POST",
        headers: { "x-guest-token": guestToken, "content-type": "application/json" },
        body: JSON.stringify({
          speciesId: testSpeciesId,
          nickname: "Privacy Plant",
          potMaterial: "plastic",
          potSizeInch: 6,
          placement: "balcony_shade",
        }),
      })
    );
  });

  it("exports customer data as JSON file attachment", async () => {
    const req = new Request("https://example.com/api/account/export", {
      headers: { "x-guest-token": guestToken },
    });
    const res = await exportData(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");
    expect(res.headers.get("content-disposition")).toContain("attachment; filename=");

    const json = await res.json();
    expect(json.guestToken).toBe(guestToken);
    expect(json.plants.length).toBeGreaterThan(0);
    expect(json.plants[0].nickname).toBe("Privacy Plant");
  });

  it("rejects anonymous callers attempting to export or delete data", async () => {
    const anonReq = new Request("https://example.com/api/account/export");
    const exportRes = await exportData(anonReq);
    expect(exportRes.status).toBe(401);

    const deleteReq = new Request("https://example.com/api/account/delete", {
      method: "POST",
    });
    const deleteRes = await deleteData(deleteReq);
    expect(deleteRes.status).toBe(401);
  });

  it("deletes all data for caller token and returns success", async () => {
    const req = new Request("https://example.com/api/account/delete", {
      method: "POST",
      headers: { "x-guest-token": guestToken },
    });
    const res = await deleteData(req);
    expect(res.status).toBe(200);

    // Verify plants are gone
    const exportReq = new Request("https://example.com/api/account/export", {
      headers: { "x-guest-token": guestToken },
    });
    const exportRes = await exportData(exportReq);
    const json = await exportRes.json();
    expect(json.plants.length).toBe(0);
  });

  it("renders GardenPdpaSection component with accessible botanical luxury card", () => {
    const html = renderToString(
      React.createElement(
        AppContextProvider,
        null,
        React.createElement(GardenPdpaSection)
      )
    );

    expect(html).toContain("การจัดการข้อมูลส่วนบุคคล (PDPA)");
    expect(html).toContain("PDPA Compliant");
    expect(html).toContain("สิทธิผู้ใช้งาน");
    expect(GardenPlantsClient).toBe(GardenPdpaSection);
  });
});

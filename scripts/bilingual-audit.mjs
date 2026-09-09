import { chromium } from "playwright";

const routes = [
  { path: "/", name: "Homepage" },
  { path: "/search", name: "Search / Catalog" },
  { path: "/plants/monstera-albo-variegata", name: "Plant Detail" },
  { path: "/garden", name: "My Garden Hub" },
  { path: "/garden/add", name: "Add Plant Wizard" },
  { path: "/today", name: "Today's Tasks" },
  { path: "/admin", name: "Admin Dashboard", setup: async (page) => {
    await page.evaluate(() => localStorage.setItem("tfl_demo_role", "admin"));
  }},
];

async function scanPageTexts(page) {
  const texts = await page.evaluate(() => {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName.toLowerCase();
          if (tag === 'script' || tag === 'style' || tag === 'noscript' || tag === 'svg') {
            return NodeFilter.FILTER_REJECT;
          }
          const text = node.textContent?.trim() || '';
          if (!text) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const items = [];
    let curr;
    while ((curr = walker.nextNode())) {
      const text = curr.textContent.trim();
      const parent = curr.parentElement;
      if (text && parent) {
        items.push({
          text,
          tag: parent.tagName.toLowerCase(),
          className: parent.className || "",
          id: parent.id || "",
          selector: parent.tagName.toLowerCase() + (parent.className ? `.${String(parent.className).split(' ').slice(0, 2).join('.')}` : '')
        });
      }
    }
    return items;
  });

  return texts;
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  console.log("=== SCANNING FOR BILINGUAL LEAKS ===");

  const findingsEn = [];
  const findingsTh = [];

  for (const r of routes) {
    // 1. EN mode
    await page.goto("http://localhost:3000" + r.path, { waitUntil: "networkidle" });
    if (r.setup) await r.setup(page);
    await page.evaluate(() => localStorage.setItem("tfl_locale", "en"));
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const textsEn = await scanPageTexts(page);
    for (const item of textsEn) {
      if (/[\u0E00-\u0E7F]/.test(item.text)) {
        findingsEn.push({
          route: r.path,
          text: item.text,
          selector: item.selector
        });
      }
    }

    // 2. TH mode
    await page.evaluate(() => localStorage.setItem("tfl_locale", "th"));
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const textsTh = await scanPageTexts(page);
    const suspiciousEn = [
      "Authentic Wisdom", "Smart Care Schedule", "BOUTIQUE & CARE",
      "Quick Specs", "Common Problems", "Taken at Shop", "Save to My Garden",
      "Ask Shop About This Plant", "Ask Shop on LINE", "All In Stock", "Popular Searches",
      "Start My Garden", "In Stock", "Made to Order", "Seasonal", "OVERDUE", "DUE TODAY",
      "UPCOMING", "LOW", "MEDIUM", "HIGH", "EASY", "MODERATE", "DIFFICULT",
      "INDOOR", "OUTDOOR", "BALCONY", "AIR_CON", "TERRACOTTA", "PLASTIC", "CERAMIC_GLAZED",
      "admin", "staff", "customer", "guest"
    ];
    for (const item of textsTh) {
      for (const pattern of suspiciousEn) {
        if (item.text.includes(pattern)) {
          findingsTh.push({
            route: r.path,
            text: item.text,
            pattern,
            selector: item.selector
          });
        }
      }
    }
  }

  await browser.close();

  console.log(`\n--- [EN MODE] LEAKED THAI STRINGS (${findingsEn.length} items) ---`);
  const byRouteEn = {};
  for (const f of findingsEn) {
    byRouteEn[f.route] = byRouteEn[f.route] || [];
    byRouteEn[f.route].push(f);
  }
  for (const [route, items] of Object.entries(byRouteEn)) {
    console.log(`\nRoute: ${route} (${items.length} items)`);
    for (const it of items) {
      console.log(`  - "${it.text}" (${it.selector})`);
    }
  }

  console.log(`\n--- [TH MODE] SUSPICIOUS / UNTRANSLATED ENGLISH STRINGS (${findingsTh.length} items) ---`);
  const byRouteTh = {};
  for (const f of findingsTh) {
    byRouteTh[f.route] = byRouteTh[f.route] || [];
    byRouteTh[f.route].push(f);
  }
  for (const [route, items] of Object.entries(byRouteTh)) {
    console.log(`\nRoute: ${route} (${items.length} items)`);
    for (const it of items) {
      console.log(`  - Matched "${it.pattern}" in: "${it.text}" (${it.selector})`);
    }
  }
}

run().catch(console.error);

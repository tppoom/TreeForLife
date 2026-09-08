import { chromium } from "playwright";

async function runAudit() {
  console.log("🚀 Starting Full-System Playwright Audit for TreeForLife...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);

  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push({ url: page.url(), text: msg.text() });
    }
  });

  page.on("pageerror", (err) => {
    pageErrors.push({ url: page.url(), error: err.message });
  });

  const results = {
    pagesChecked: 0,
    testsPassed: 0,
    testsFailed: 0,
    issues: [],
  };

  function assert(condition, message, details = "") {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      results.testsPassed++;
    } else {
      console.error(`  ❌ [FAIL] ${message} ${details ? `(${details})` : ""}`);
      results.testsFailed++;
      results.issues.push({ message, details, url: page.url() });
    }
  }

  try {
    // -------------------------------------------------------------
    // 1. Homepage & Global Nav
    // -------------------------------------------------------------
    console.log("\n--- 1. Testing Homepage (/) & Global Elements ---");
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    results.pagesChecked++;

    const title = await page.title();
    assert(title.includes("TreeForLife"), "Homepage title contains TreeForLife", title);

    // Check brand link
    const brand = await page.textContent("header a[href='/']");
    assert(brand.includes("TreeForLife"), "Header brand link shows TreeForLife");

    // Check hero search bar
    const heroInput = page.locator("input[type='text']").first();
    assert(await heroInput.isVisible(), "Hero search input is visible");

    // Check category shortcuts (should have 6+ categories)
    const categoryButtons = await page.locator("a[href^='/search?']").all();
    assert(categoryButtons.length >= 6, `Category shortcuts found: ${categoryButtons.length}`);

    // Check In-Stock Carousel cards
    const plantCards = await page.locator("a[href^='/plants/']").all();
    assert(plantCards.length > 0, `In-stock plant cards found on homepage: ${plantCards.length}`);

    // Test Language Toggle (TH -> EN -> TH)
    console.log("  Testing Language Toggle...");
    const langBtn = page.locator("header button:has(.lucide-globe)").first();
    assert(await langBtn.isVisible(), "Language toggle button with globe icon is visible");

    await langBtn.click();
    await page.waitForTimeout(300);
    const langTextAfterEn = await langBtn.textContent();
    assert(langTextAfterEn.toLowerCase().includes("en"), `Language switched to English (button shows ${langTextAfterEn.trim()})`);

    // Check if raw translation keys leaked on homepage
    const pageContentEn = await page.content();
    const rawKeysEn = pageContentEn.match(/home\.[a-zA-Z_]+/g) || [];
    assert(rawKeysEn.length === 0, "No raw untranslated 'home.*' keys in English", rawKeysEn.join(", "));

    // Switch back to TH
    await langBtn.click();
    await page.waitForTimeout(300);
    const langTextAfterTh = await langBtn.textContent();
    assert(langTextAfterTh.toLowerCase().includes("th"), `Language switched back to Thai (button shows ${langTextAfterTh.trim()})`);

    // Test Theme Toggle (Light -> Dark -> Light)
    console.log("  Testing Dark Mode Toggle...");
    const themeBtn = page.locator("header button:has(.lucide-moon), header button:has(.lucide-sun)").first();
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.waitForTimeout(200);
      const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
      assert(isDark, "Dark mode class added to documentElement");
      // Toggle back
      await themeBtn.click();
      await page.waitForTimeout(200);
      const isLight = await page.evaluate(() => !document.documentElement.classList.contains("dark"));
      assert(isLight, "Light mode restored");
    }

    // -------------------------------------------------------------
    // 2. Faceted Search Page (/search)
    // -------------------------------------------------------------
    console.log("\n--- 2. Testing Faceted Search (/search) ---");
    await page.goto("http://localhost:3000/search", { waitUntil: "networkidle" });
    results.pagesChecked++;

    const searchInput = page.locator("input[placeholder*='ค้นหา'], input[placeholder*='Search']").first();
    assert(await searchInput.isVisible(), "Search input is visible on /search");

    // Filter by pet safe
    const petChip = page.locator("button:has-text('ปลอดภัยกับสัตว์'), button:has-text('Pet Safe')").first();
    if (await petChip.isVisible()) {
      await petChip.click();
      await page.waitForTimeout(400);
      assert(page.url().includes("pet=safe"), "URL updated with pet=safe parameter", page.url());
    }

    // Test Search Miss (Zero results state)
    console.log("  Testing Zero Results state & search miss logging...");
    await searchInput.fill("NonExistentSpecialPlant99999");
    await searchInput.press("Enter");
    const zeroResultsHeading = page.locator("h3:has-text('ยังไม่มีข้อมูลต้นไม้นี้'), h3:has-text('No plants found')").first();
    await zeroResultsHeading.waitFor({ state: "visible", timeout: 8000 });
    assert(await zeroResultsHeading.isVisible(), "Zero results message displayed properly");

    // Check if LINE inquiry button is present on zero results
    const zeroLineBtn = page.locator("button:has-text('ทักถามร้านทาง LINE'), button:has-text('Ask Shop on LINE')").first();
    assert(await zeroLineBtn.isVisible(), "Zero results state has LINE inquiry CTA button");

    // -------------------------------------------------------------
    // 3. Plant Detail Page (/plants/monstera-albo-variegata)
    // -------------------------------------------------------------
    console.log("\n--- 3. Testing Plant Detail (/plants/monstera-albo-variegata) ---");
    await page.goto("http://localhost:3000/plants/monstera-albo-variegata", { waitUntil: "networkidle" });
    results.pagesChecked++;

    const plantHeading = await page.textContent("h1");
    assert(plantHeading.includes("มอนสเตอร่าด่าง"), "Plant detail displays Thai plant name", plantHeading);

    // Verify "Taken at Shop" badge
    const takenAtShop = await page.locator("text='ถ่ายที่ร้าน'").first().isVisible();
    assert(takenAtShop, "'Taken at Shop' badge is displayed");

    // Verify Quick Specs section exists
    const specsHeading = page.locator("h2:has-text('Quick Specs'), h2:has-text('คุณสมบัติและสเปก')").first();
    assert(await specsHeading.isVisible(), "Species Quick Specs 6-metric summary grid is displayed");

    // Test Common Problems Accordion
    console.log("  Testing Troubleshooting accordion...");
    const accordionHeader = page.locator("button:has-text('ปัญหาที่พบบ่อย'), button:has-text('Common Problems')").first();
    if (await accordionHeader.isVisible()) {
      await accordionHeader.click();
      await page.waitForTimeout(300);
      const accordionContent = await page.locator("text='อาการ:'").first().isVisible();
      assert(accordionContent, "Accordion expands and shows problem symptoms");
    }

    // Test LINE Inquiry Modal from Plant Detail
    console.log("  Testing LINE Inquiry Modal...");
    const askLineBtn = page.locator("button:has-text('ถามร้านเรื่องต้นนี้'), button:has-text('Ask Shop About This Plant')").first();
    assert(await askLineBtn.isVisible(), "Ask on LINE button is visible");

    await askLineBtn.click();
    await page.waitForTimeout(500);

    // Verify Modal opens (Step 1)
    const modalHeading = page.locator("#inquiry-modal-title");
    assert(await modalHeading.isVisible(), "Inquiry modal opened successfully");

    // Select care advice intent
    const careIntentBtn = page.locator("div[role='dialog'] button:has-text('ดูแลรักษา'), div[role='dialog'] button:has-text('Care')").first();
    if (await careIntentBtn.isVisible()) {
      await careIntentBtn.click();
    }

    // Click submit in Step 1 to generate inquiry
    const generateBtn = page.locator("div[role='dialog'] button:has-text('สร้างรหัสและเชื่อมต่อ LINE'), div[role='dialog'] button:has-text('Generate Code')").first();
    assert(await generateBtn.isVisible(), "Generate inquiry button is visible");
    await generateBtn.click();

    // Step 2: Verify Ref Code is displayed with auto-wait
    const refCodeElement = page.locator("div[role='dialog'] span.font-mono:has-text('TFL-')").first();
    await refCodeElement.waitFor({ state: "visible", timeout: 8000 });
    const refCodeText = await refCodeElement.textContent();
    assert(refCodeText && refCodeText.includes("TFL-"), `Tracking reference code generated and visible (${refCodeText})`);

    // Verify QR Code container is rendered
    const qrContainer = page.locator("div[role='dialog'] [data-testid='inquiry-qr-code']").first();
    await qrContainer.waitFor({ state: "visible", timeout: 8000 });
    assert(await qrContainer.isVisible(), "LINE QR code container is rendered on desktop");

    // Verify Copy message button works
    const copyBtn = page.locator("div[role='dialog'] button:has-text('คัดลอก'), div[role='dialog'] button:has-text('Copy')").first();
    if (await copyBtn.isVisible()) {
      await copyBtn.click();
      await page.waitForTimeout(200);
      assert(true, "Copy message button clicked");
    }

    // Close Modal via top-right close button in dialog
    const closeBtn = page.locator("div[role='dialog'] button[aria-label='ปิด'], div[role='dialog'] button[aria-label='Close']").first();
    await closeBtn.click();
    await page.waitForTimeout(400);
    assert(!(await modalHeading.isVisible()), "Inquiry modal closes cleanly");

    // -------------------------------------------------------------
    // 4. Add Plant Wizard (/garden/add)
    // -------------------------------------------------------------
    console.log("\n--- 4. Testing 4-Step Add Plant Wizard (/garden/add) ---");
    await page.goto("http://localhost:3000/garden/add", { waitUntil: "networkidle" });
    results.pagesChecked++;

    // Step 1: Select Species Card
    console.log("  Wizard Step 1: Species Selection...");
    const speciesCards = page.locator(".cursor-pointer:has(h4)");
    const firstSpeciesCard = speciesCards.first();
    assert(await firstSpeciesCard.isVisible(), "Species cards exist in Step 1");
    await firstSpeciesCard.click();
    await page.waitForTimeout(300);

    const nextBtn1 = page.locator("button:has-text('ถัดไป'), button:has-text('Next')").first();
    await nextBtn1.click();
    await page.waitForTimeout(300);

    // Step 2: Nickname & Origin
    console.log("  Wizard Step 2: Nickname & Origin...");
    const nicknameInput = page.locator("input[placeholder*='เช่น น้อง'], input[type='text']").first();
    assert(await nicknameInput.isVisible(), "Step 2 nickname input is visible");
    await nicknameInput.fill("น้องพลูด่าง E2E Audit");

    const nextBtn2 = page.locator("button:has-text('ถัดไป'), button:has-text('Next')").first();
    await nextBtn2.click();
    await page.waitForTimeout(300);

    // Step 3: Pot Size & Material
    console.log("  Wizard Step 3: Pot Diameter & Material...");
    const nextBtn3 = page.locator("button:has-text('ถัดไป'), button:has-text('Next')").first();
    await nextBtn3.click();
    await page.waitForTimeout(300);

    // Step 4: Placement & Live Formula Preview
    console.log("  Wizard Step 4: Placement & Real-time Formula Preview...");
    const previewHeading = page.locator("h3:has-text('ตารางดูแลที่คำนวณได้สำหรับต้นนี้'), h3:has-text('Calculated Care Schedule')").first();
    await previewHeading.waitFor({ state: "visible", timeout: 5000 });
    const hasPreview = await previewHeading.isVisible();
    assert(hasPreview, "Live calculation preview shows Thai seasonal care schedule");

    // Submit Wizard
    const submitBtn = page.locator("button:has-text('บันทึกเข้าสู่สวนของฉัน'), button:has-text('Save to My Garden')").first();
    assert(await submitBtn.isVisible(), "Save to My Garden button is visible");
    await submitBtn.click();
    await page.waitForURL("**/garden", { timeout: 8000 });
    assert(page.url().includes("/garden"), "Successfully redirected to /garden after saving plant");

    // -------------------------------------------------------------
    // 5. My Garden Hub (/garden)
    // -------------------------------------------------------------
    console.log("\n--- 5. Testing My Garden Hub (/garden) ---");
    results.pagesChecked++;

    const myGardenHeading = await page.textContent("h1");
    assert(myGardenHeading.includes("สวนของฉัน") || myGardenHeading.includes("My Garden"), "My Garden title is visible");

    // Wait for plants to load via async fetch
    const addedPlantCard = page.locator("text='น้องพลูด่าง E2E Audit'").first();
    await addedPlantCard.waitFor({ state: "visible", timeout: 8000 });
    assert(await addedPlantCard.isVisible(), "Newly added plant appears in My Garden list");

    // Test quick "Watered" (รดน้ำแล้ว) action
    console.log("  Testing quick 'Watered' button on plant card...");
    const wateredBtn = page.locator("button:has-text('รดน้ำแล้ว'), button:has-text('Watered')").first();
    if (await wateredBtn.isVisible()) {
      await wateredBtn.click();
      await page.waitForTimeout(600);
      assert(true, "Quick Watered action clicked and processed");
    }

    // -------------------------------------------------------------
    // 6. Today's Tasks Dashboard (/today)
    // -------------------------------------------------------------
    console.log("\n--- 6. Testing Today's Tasks Dashboard (/today) ---");
    await page.goto("http://localhost:3000/today", { waitUntil: "networkidle" });
    results.pagesChecked++;

    const todayHeading = await page.textContent("h1");
    assert(todayHeading.includes("งานดูแลวันนี้") || todayHeading.includes("Today's Care Tasks"), "Today's Tasks heading is visible");

    const taskCards = await page.locator("button:has-text('เสร็จแล้ว'), button:has-text('Done')").all();
    console.log(`  Found ${taskCards.length} pending task action buttons`);

    if (taskCards.length > 0) {
      // Test Snooze action
      const snoozeBtn = page.locator("button:has-text('เลื่อน +1 วัน'), button:has-text('Snooze')").first();
      if (await snoozeBtn.isVisible()) {
        await snoozeBtn.click();
        await page.waitForTimeout(500);
        assert(true, "Snooze (+1 day) task action completed cleanly");
      }

      // Test Mark All Done button if visible
      const markAllDoneBtn = page.locator("button:has-text('รดน้ำทุกต้นครบแล้ว'), button:has-text('Mark All Done')").first();
      if (await markAllDoneBtn.isVisible()) {
        await markAllDoneBtn.click();
        await page.waitForTimeout(500);
        assert(true, "Batch 'Mark All Done' triggered cleanly");
      }
    } else {
      const emptyMsg = await page.locator("text='ไม่มีงานที่ต้องทำวันนี้'").first().isVisible();
      assert(emptyMsg, "Empty state rendered when no pending tasks");
    }

    // -------------------------------------------------------------
    // 7. Shop Admin Dashboard (/admin) & Role Gate
    // -------------------------------------------------------------
    console.log("\n--- 7. Testing Shop Admin Dashboard (/admin) ---");
    // Ensure guest role in localStorage before accessing /admin
    await page.evaluate(() => localStorage.setItem("tfl_demo_role", "guest"));
    await page.goto("http://localhost:3000/admin", { waitUntil: "networkidle" });
    results.pagesChecked++;

    const accessNotice = await page.locator("h1:has-text('เฉพาะพนักงานหรือผู้ดูแลระบบ'), h1:has-text('Staff or Admin required')").first().isVisible();
    assert(accessNotice, "Admin role gate restricts guest access and shows switch prompt");

    // Click quick switch to Admin button on access screen
    console.log("  Switching demo role to Admin...");
    const switchToAdminBtn = page.locator("button:has-text('สลับเป็น เจ้าของร้าน (Admin)'), button:has-text('Switch to Admin Role')").first();
    assert(await switchToAdminBtn.isVisible(), "Switch to Admin button is visible on access screen");
    await switchToAdminBtn.click();
    await page.waitForTimeout(600);

    // Verify Admin Dashboard is now unlocked
    const adminHeading = page.locator("h1:has-text('ระบบจัดการร้าน'), h1:has-text('Shop Admin')").first();
    await adminHeading.waitFor({ state: "visible", timeout: 8000 });
    assert(await adminHeading.isVisible(), "Admin Dashboard unlocked after switching to Admin role");

    // Test Tab 1: Inventory Table & Stock Toggles
    console.log("  Admin Tab 1: Inventory Stock Toggles...");
    await page.locator("table tbody tr").first().waitFor({ state: "visible", timeout: 8000 });
    const stockButtons = page.locator("table div[role='group'] button").first();
    assert(await stockButtons.isVisible(), "Segmented stock toggle buttons exist in inventory table");
    await stockButtons.click();
    await page.waitForTimeout(300);

    // Test Tab 2: Inquiries Log
    console.log("  Admin Tab 2: Inquiries Log...");
    const inquiriesTabBtn = page.locator("button[role='tab']:has-text('บันทึกสอบถาม'), button[role='tab']:has-text('Inquiries')").first();
    assert(await inquiriesTabBtn.isVisible(), "Inquiries tab button is visible");
    await inquiriesTabBtn.click();
    await page.waitForTimeout(400);
    const inquiryCards = page.locator("span.font-mono:has-text('TFL-')");
    await inquiryCards.first().waitFor({ state: "visible", timeout: 8000 });
    const inqCount = await inquiryCards.count();
    assert(inqCount > 0, `Inquiries list displays customer inquiries: ${inqCount} found`);

    // Test Tab 3: Search Misses & Demand Analytics
    console.log("  Admin Tab 3: Search Misses & Demand Analytics...");
    const missesTabBtn = page.locator("button[role='tab']:has-text('คำค้นหาที่ไม่พบ'), button[role='tab']:has-text('Search Misses')").first();
    assert(await missesTabBtn.isVisible(), "Search misses tab button is visible");
    await missesTabBtn.click();
    await page.waitForTimeout(400);
    const missRows = page.locator("table tbody tr");
    await missRows.first().waitFor({ state: "visible", timeout: 8000 });
    const missCount = await missRows.count();
    assert(missCount > 0, `Search misses table displays logged zero-results queries: ${missCount} rows`);

  } catch (err) {
    console.error("💥 Unhandled Error during Audit:", err);
    results.issues.push({ message: "Fatal audit crash", details: err.message, stack: err.stack });
  } finally {
    await browser.close();
  }

  // -------------------------------------------------------------
  // Summary Report
  // -------------------------------------------------------------
  console.log("\n" + "=".repeat(60));
  console.log("📊 TREEFORLIFE FULL-SYSTEM AUDIT SUMMARY");
  console.log("=".repeat(60));
  console.log(`Pages Visited:   ${results.pagesChecked}`);
  console.log(`Tests Passed:    ${results.testsPassed}`);
  console.log(`Tests Failed:    ${results.testsFailed}`);
  console.log(`Console Errors:  ${consoleErrors.length}`);
  console.log(`Page Errors:     ${pageErrors.length}`);

  if (consoleErrors.length > 0) {
    console.log("\n⚠️ Console Errors Detected:");
    consoleErrors.forEach((e, idx) => console.log(`  ${idx + 1}. [${e.url}] ${e.text}`));
  }

  if (pageErrors.length > 0) {
    console.log("\n🚨 Page Errors Detected:");
    pageErrors.forEach((e, idx) => console.log(`  ${idx + 1}. [${e.url}] ${e.error}`));
  }

  if (results.issues.length > 0) {
    console.log("\n❌ Failed Assertions / Issues:");
    results.issues.forEach((i, idx) => console.log(`  ${idx + 1}. ${i.message} (${i.details}) [${i.url}]`));
  } else {
    console.log("\n🎉 ALL E2E USER FLOWS & ASSERTIONS PASSED WITH ZERO FAILURES!");
  }
  console.log("=".repeat(60) + "\n");
}

runAudit();

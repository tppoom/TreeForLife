import { test, expect } from '@playwright/test';

test.describe.serial('TreeForLife Complete User Journey & E2E Audit', () => {
  test.use({
    viewport: { width: 1280, height: 900 },
    permissions: ['clipboard-read', 'clipboard-write'],
  });

  test('1. Homepage & Global Nav: Hero, shortcuts, carousel, language and theme toggle', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Homepage title and branding
    await expect(page).toHaveTitle(/TreeForLife/);
    const brand = page.locator('header a:has-text("TreeForLife")').first();
    await expect(brand).toBeVisible();

    // Hero search input
    const heroInput = page.locator('input[type="text"]').first();
    await expect(heroInput).toBeVisible();

    // Category shortcuts
    const shortcuts = page.locator('a[href^="/search?"]');
    expect(await shortcuts.count()).toBeGreaterThanOrEqual(6);

    // In-stock species cards
    const plantCards = page.locator('a[href^="/plants/"]');
    expect(await plantCards.count()).toBeGreaterThan(0);

    // Language Toggle (TH -> EN -> TH)
    const langBtn = page.locator('header button:has(.lucide-globe)').first();
    await expect(langBtn).toBeVisible();

    await langBtn.click();
    await expect(langBtn).toContainText(/en/i, { timeout: 5000 });

    // Verify zero raw translation keys in English
    const contentEn = await page.content();
    const rawKeys = contentEn.match(/home\.[a-zA-Z_]+/g) || [];
    expect(rawKeys).toHaveLength(0);

    // Switch back to TH
    await langBtn.click();
    await expect(langBtn).toContainText(/th/i, { timeout: 5000 });

    // Dark Mode Toggle (Light -> Dark -> Light)
    const themeBtn = page.locator('header button:has(.lucide-moon), header button:has(.lucide-sun)').first();
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.waitForTimeout(200);
      const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
      expect(isDark).toBe(true);

      await themeBtn.click();
      await page.waitForTimeout(200);
      const isLight = await page.evaluate(() => !document.documentElement.classList.contains('dark'));
      expect(isLight).toBe(true);
    }
  });

  test('2. Faceted Search: Filter chips, query sync, and zero-results state with LINE CTA', async ({ page }) => {
    await page.goto('/search', { waitUntil: 'networkidle' });

    const searchInput = page.locator('input[placeholder*="ค้นหา"], input[placeholder*="Search"]').first();
    await expect(searchInput).toBeVisible();

    // Filter by pet safe
    const petChip = page.locator('button:has-text("ปลอดภัยกับสัตว์"), button:has-text("Pet Safe")').first();
    if (await petChip.isVisible()) {
      await petChip.click();
      await page.waitForURL(/pet=safe/, { timeout: 8000 });
      expect(page.url()).toContain('pet=safe');
    }

    // Zero-results state and search miss logging
    await searchInput.fill('NonExistentSpecialPlant99999');
    await searchInput.press('Enter');

    const zeroResultsHeading = page.locator('h3:has-text("ยังไม่มีข้อมูลต้นไม้นี้"), h3:has-text("No plants found")').first();
    await expect(zeroResultsHeading).toBeVisible({ timeout: 8000 });

    const zeroLineBtn = page.locator('button:has-text("ทักถามร้านทาง LINE"), button:has-text("Ask Shop on LINE")').first();
    await expect(zeroLineBtn).toBeVisible();
  });

  test('3. Plant Detail & LINE Inquiry Modal: Specs, accordion, ref code generation, and QR display', async ({ page }) => {
    await page.goto('/plants/monstera-albo-variegata', { waitUntil: 'networkidle' });

    // Plant botanical title
    const heading = page.locator('h1').first();
    await expect(heading).toContainText(/มอนสเตอร่าด่าง/);

    // "Taken at Shop" badge
    const takenBadge = page.locator('text="ถ่ายที่ร้าน"').first();
    await expect(takenBadge).toBeVisible();

    // 6-metric summary grid
    const specsHeading = page.locator('h2:has-text("Quick Specs"), h2:has-text("คุณสมบัติและสเปก")').first();
    await expect(specsHeading).toBeVisible();

    // Troubleshooting accordion
    const accordionBtn = page.locator('button:has-text("ปัญหาที่พบบ่อย"), button:has-text("Common Problems")').first();
    if (await accordionBtn.isVisible()) {
      await accordionBtn.click();
      const symptom = page.locator('text="อาการ:"').first();
      await expect(symptom).toBeVisible();
    }

    // LINE Inquiry Modal
    const askLineBtn = page.locator('button:has-text("ถามร้านเรื่องต้นนี้"), button:has-text("Ask Shop About This Plant")').first();
    await expect(askLineBtn).toBeVisible();
    await askLineBtn.click();

    const modalTitle = page.locator('#inquiry-modal-title');
    await expect(modalTitle).toBeVisible();

    // Select care intent
    const careIntentBtn = page.locator('div[role="dialog"] button:has-text("ดูแลรักษา"), div[role="dialog"] button:has-text("Care")').first();
    if (await careIntentBtn.isVisible()) {
      await careIntentBtn.click();
    }

    // Submit Step 1
    const generateBtn = page.locator('div[role="dialog"] button:has-text("สร้างรหัสและเชื่อมต่อ LINE"), div[role="dialog"] button:has-text("Generate Code")').first();
    await expect(generateBtn).toBeVisible();
    await generateBtn.click();

    // Step 2: Ref code display
    const refCodeElement = page.locator('div[role="dialog"] span.font-mono:has-text("TFL-")').first();
    await expect(refCodeElement).toBeVisible({ timeout: 8000 });
    const refCodeText = await refCodeElement.textContent();
    expect(refCodeText).toContain('TFL-');

    // Desktop QR code
    const qrContainer = page.locator('div[role="dialog"] [data-testid="inquiry-qr-code"]').first();
    await expect(qrContainer).toBeVisible({ timeout: 8000 });

    // Copy message button
    const copyBtn = page.locator('div[role="dialog"] button:has-text("คัดลอก"), div[role="dialog"] button:has-text("Copy")').first();
    if (await copyBtn.isVisible()) {
      await copyBtn.click();
    }

    // Dismiss modal
    const closeBtn = page.locator('div[role="dialog"] button[aria-label="ปิด"], div[role="dialog"] button[aria-label="Close"]').first();
    await closeBtn.click();
    await expect(modalTitle).not.toBeVisible();
  });

  test('4. Add Plant Wizard: 4 steps, real-time care calculation preview, and save to My Garden', async ({ page }) => {
    await page.goto('/garden/add', { waitUntil: 'networkidle' });

    // Step 1: Species Selection
    const speciesCards = page.locator('.cursor-pointer:has(h4)');
    const firstSpeciesCard = speciesCards.first();
    await expect(firstSpeciesCard).toBeVisible();
    await firstSpeciesCard.click();
    await page.waitForTimeout(300);

    const nextBtn1 = page.locator('button:has-text("ถัดไป"), button:has-text("Next")').first();
    await nextBtn1.click();
    await page.waitForTimeout(300);

    // Step 2: Nickname & Origin
    const testPlantName = `น้องพลูด่าง E2E Test ${Date.now() % 10000}`;
    const nicknameInput = page.locator('input[placeholder*="เช่น น้อง"], input[type="text"]').first();
    await expect(nicknameInput).toBeVisible();
    await nicknameInput.fill(testPlantName);

    const nextBtn2 = page.locator('button:has-text("ถัดไป"), button:has-text("Next")').first();
    await nextBtn2.click();
    await page.waitForTimeout(300);

    // Step 3: Pot Size & Material
    const nextBtn3 = page.locator('button:has-text("ถัดไป"), button:has-text("Next")').first();
    await nextBtn3.click();
    await page.waitForTimeout(300);

    // Step 4: Placement & Live Formula Preview
    const previewHeading = page.locator('h3:has-text("ตารางดูแลที่คำนวณได้สำหรับต้นนี้"), h3:has-text("Calculated Care Schedule")').first();
    await expect(previewHeading).toBeVisible({ timeout: 5000 });

    // Submit Wizard
    const submitBtn = page.locator('button:has-text("บันทึกเข้าสู่สวนของฉัน"), button:has-text("Save to My Garden")').first();
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Redirection to /garden
    await page.waitForURL('**/garden', { timeout: 8000 });
    expect(page.url()).toContain('/garden');

    // Verify plant appears in garden hub
    const addedCard = page.locator(`text="${testPlantName}"`).first();
    await expect(addedCard).toBeVisible({ timeout: 8000 });

    // Quick "Watered" action button
    const wateredBtn = page.locator('button:has-text("รดน้ำแล้ว"), button:has-text("Watered")').first();
    if (await wateredBtn.isVisible()) {
      await wateredBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('5. Today\'s Tasks Dashboard: Daily tasks, snooze (+1d), and batch mark all done', async ({ page }) => {
    await page.goto('/today', { waitUntil: 'networkidle' });

    const heading = page.locator('h1').first();
    await expect(heading).toContainText(/งานดูแลวันนี้|Today's Care Tasks/);

    // Wait for either pending tasks or clean empty state
    const taskDoneBtns = page.locator('button:has-text("เสร็จแล้ว"), button:has-text("Done")');
    const hasTasksOrEmpty = await Promise.race([
      taskDoneBtns.first().waitFor({ state: 'visible', timeout: 5000 }).then(() => 'tasks').catch(() => null),
      page.locator('[data-testid="today-empty-state"]').waitFor({ state: 'visible', timeout: 5000 }).then(() => 'empty').catch(() => null),
    ]);

    if (hasTasksOrEmpty === 'tasks') {
      const snoozeBtn = page.locator('button:has-text("เลื่อน +1 วัน"), button:has-text("Snooze")').first();
      if (await snoozeBtn.isVisible()) {
        await snoozeBtn.click();
        await page.waitForTimeout(500);
      }

      const markAllDoneBtn = page.locator('button:has-text("รดน้ำทุกต้นครบแล้ว"), button:has-text("Mark All Done")').first();
      if (await markAllDoneBtn.isVisible()) {
        await markAllDoneBtn.click();
        await page.waitForTimeout(500);
      }
    } else {
      const emptyState = page.locator('[data-testid="today-empty-state"], h2:has-text("ดูแลครบทุกต้นแล้ว")').first();
      await expect(emptyState).toBeVisible();
    }
  });

  test('6. Shop Admin Dashboard: Guest role gate, upgrade to Admin, inventory toggles, inquiries log, search misses', async ({ page }) => {
    // 1. Ensure guest role
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.setItem('tfl_demo_role', 'guest'));
    await page.goto('/admin', { waitUntil: 'networkidle' });

    // Role gate notice
    const accessNotice = page.locator('h1:has-text("เฉพาะพนักงานหรือผู้ดูแลระบบ"), h1:has-text("Staff or Admin required")').first();
    await expect(accessNotice).toBeVisible();

    // Quick switch to Admin
    const switchToAdminBtn = page.locator('button:has-text("สลับเป็น เจ้าของร้าน (Admin)"), button:has-text("Switch to Admin Role")').first();
    await expect(switchToAdminBtn).toBeVisible();
    await switchToAdminBtn.click();
    await page.waitForTimeout(600);

    // Admin Dashboard unlocked
    const adminHeading = page.locator('h1:has-text("ระบบจัดการร้าน"), h1:has-text("Shop Admin")').first();
    await expect(adminHeading).toBeVisible({ timeout: 8000 });

    // Tab 1: Inventory Table & Stock Toggles
    const tableRow = page.locator('table tbody tr').first();
    await expect(tableRow).toBeVisible({ timeout: 8000 });
    const stockButtons = page.locator('table div[role="group"] button').first();
    await expect(stockButtons).toBeVisible();
    await stockButtons.click();
    await page.waitForTimeout(300);

    // Tab 2: Inquiries Log
    const inquiriesTabBtn = page.locator('button[role="tab"]:has-text("บันทึกสอบถาม"), button[role="tab"]:has-text("Inquiries")').first();
    await expect(inquiriesTabBtn).toBeVisible();
    await inquiriesTabBtn.click();
    await page.waitForTimeout(400);
    const inquiryCards = page.locator('span.font-mono:has-text("TFL-")');
    await expect(inquiryCards.first()).toBeVisible({ timeout: 8000 });
    const inqCount = await inquiryCards.count();
    expect(inqCount).toBeGreaterThan(0);

    // Tab 3: Search Misses & Demand Analytics
    const missesTabBtn = page.locator('button[role="tab"]:has-text("คำค้นหาที่ไม่พบ"), button[role="tab"]:has-text("Search Misses")').first();
    await expect(missesTabBtn).toBeVisible();
    await missesTabBtn.click();
    await page.waitForTimeout(400);
    const missRows = page.locator('table tbody tr');
    await expect(missRows.first()).toBeVisible({ timeout: 8000 });
    const missCount = await missRows.count();
    expect(missCount).toBeGreaterThan(0);
  });
});

import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT || 3000);
// Second server for the production-mode suite (no demo role switcher)
const PROD_PORT = PORT + 1;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: /production-mode\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'production-mode',
      testMatch: /production-mode\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: `http://localhost:${PROD_PORT}` },
    },
  ],
  webServer: [
    {
      // Demo mode: the main suite drives the back office through the demo role
      // switcher, which production builds hide (roles there come from LINE Login).
      command: `NEXT_PUBLIC_APP_MODE=demo npm run dev -- -p ${PORT}`,
      url: `http://localhost:${PORT}`,
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      // Separate build dir and database: two dev servers cannot share .next or a PGlite dir
      command: `NEXT_PUBLIC_APP_MODE=production NEXT_DIST_DIR=.next-e2e-prod PGLITE_DATA_DIR=.data/pglite-e2e-prod npm run dev -- -p ${PROD_PORT}`,
      url: `http://localhost:${PROD_PORT}`,
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],
});

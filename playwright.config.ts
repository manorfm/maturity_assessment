import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  timeout: 420_000,
  workers: 1,
  reporter: 'line',
  use: { baseURL: 'http://127.0.0.1:3218', headless: true },
  webServer: {
    command: 'DATABASE_PATH=/private/tmp/maturity-assessment-e2e-v14.sqlite SHOWCASE_GUIDE=/private/tmp/maturity-assessment-showcase-v14.html npm run demo:test-server',
    url: 'http://127.0.0.1:3218/health',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});

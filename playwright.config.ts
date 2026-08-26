import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  timeout: 120_000,
  workers: 1,
  reporter: 'line',
  use: { baseURL: 'http://127.0.0.1:3217', headless: true },
  webServer: {
    command: 'npm run demo',
    url: 'http://127.0.0.1:3217/health',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});

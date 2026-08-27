import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  timeout: 120_000,
  workers: 1,
  reporter: 'line',
  use: { baseURL: 'http://127.0.0.1:3218', headless: true },
  webServer: {
    command: 'npm run demo:test-server',
    url: 'http://127.0.0.1:3218/health',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});

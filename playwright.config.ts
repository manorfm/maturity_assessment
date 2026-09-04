import { defineConfig } from '@playwright/test';

const testPort = process.env.E2E_PORT ?? '3218';
const databasePath = process.env.E2E_DATABASE_PATH ?? '/private/tmp/maturity-assessment-e2e-pilot-v1.sqlite';
const showcaseGuide = process.env.E2E_SHOWCASE_GUIDE ?? '/private/tmp/maturity-assessment-showcase-pilot-v1.html';
const showcaseManifest = process.env.SHOWCASE_MANIFEST ?? '/private/tmp/maturity-assessment-showcase-poc.json';

export default defineConfig({
  testDir: './test/e2e',
  timeout: 60_000,
  workers: 1,
  reporter: 'line',
  use: { baseURL: `http://127.0.0.1:${testPort}`, headless: true },
  webServer: {
    command: 'npm run demo:test-server',
    env: {
      DATABASE_PATH: databasePath,
      SHOWCASE_GUIDE: showcaseGuide,
      SHOWCASE_MANIFEST: showcaseManifest,
      PORT: testPort,
    },
    url: `http://127.0.0.1:${testPort}/health`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});

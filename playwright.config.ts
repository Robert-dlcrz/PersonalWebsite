import { defineConfig, devices } from '@playwright/test';

import { blobHostname } from './next.config';

/**
 * BASE_URL points the suite at an already-deployed target (the pull request's
 * Vercel preview in CI). When it is unset, Playwright builds and serves the app
 * locally so the same spec runs unchanged on a developer machine.
 */
const baseURLFromEnv = process.env.BASE_URL?.trim();
const port = Number(process.env.PORT ?? 3000);
const localBaseURL = `http://127.0.0.1:${port}`;

// Trip and blog data are fetched from Vercel Blob at build time; see AGENTS.md.
const blobBaseURL = process.env.BLOB_BASE_URL ?? `https://${blobHostname}`;

// The homepage hides the single-line hero heading below 1180px, so every project
// runs wide enough to exercise the desktop layout. The height fits all three
// home cards so the asserted content is on screen rather than below the fold.
const viewport = { width: 1280, height: 1000 };

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }], ['list']]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: baseURLFromEnv ?? localBaseURL,
    viewport,
    contextOptions: { reducedMotion: 'reduce' },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport },
    },
  ],
  webServer: baseURLFromEnv
    ? undefined
    : {
        command: 'pnpm build:next && pnpm start',
        url: localBaseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 300_000,
        stdout: 'pipe',
        stderr: 'pipe',
        env: {
          BLOB_BASE_URL: blobBaseURL,
          PORT: String(port),
        },
      },
});

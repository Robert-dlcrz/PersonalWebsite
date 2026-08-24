import { defineConfig, devices } from '@playwright/test';

import { blobHostname } from './next.config';

const SECRET_SETUP_HINT =
  'Generate it in Vercel (Project → Settings → Deployment Protection → Protection Bypass ' +
  'for Automation) and store it as a GitHub Actions secret named VERCEL_AUTOMATION_BYPASS_SECRET.';

/**
 * The suite runs in exactly one of two modes, resolved and validated here so a
 * misconfigured environment fails at config load with an actionable message
 * instead of surfacing later as a confusing test failure.
 *
 * - local: E2E_BASE_URL is unset (or points at localhost). Playwright builds
 *   and serves the app itself; no Vercel bypass secret may be present.
 * - preview: E2E_BASE_URL points at an https *.vercel.app deployment (the pull
 *   request's preview in CI). The Deployment Protection bypass secret is
 *   required, and e2e/fixtures.ts sends it only to that origin.
 */
type Target =
  | { mode: 'local'; baseURL: string }
  | { mode: 'preview'; baseURL: string; bypassSecret: string };

function resolveTarget(): Target {
  const rawBaseURL = process.env.E2E_BASE_URL?.trim();
  const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim();
  const isCI = Boolean(process.env.CI);

  if (!rawBaseURL) {
    if (isCI) {
      throw new Error(
        'E2E_BASE_URL is not set but CI is. In CI this suite must test the Vercel preview; ' +
          'silently building and serving the app here would produce a green check that never ' +
          'touched the deployment. Set E2E_BASE_URL to the preview URL.',
      );
    }
    if (bypassSecret) {
      throw new Error(
        'VERCEL_AUTOMATION_BYPASS_SECRET is set but E2E_BASE_URL is not. The bypass secret is ' +
          'only for preview targets and must never be sent to a local server; unset it for local runs.',
      );
    }
    const port = Number(process.env.PORT ?? 3000);
    return { mode: 'local', baseURL: `http://127.0.0.1:${port}` };
  }

  let url: URL;
  try {
    url = new URL(rawBaseURL);
  } catch {
    throw new Error(`E2E_BASE_URL is not a valid URL: "${rawBaseURL}"`);
  }

  // Escape hatch: an explicit localhost target (e.g. a dev server you already
  // started) is treated as local mode and validated the same way.
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    if (isCI) {
      throw new Error(
        `E2E_BASE_URL points at ${url.hostname} but CI is set. CI must test the Vercel preview.`,
      );
    }
    if (bypassSecret) {
      throw new Error(
        'VERCEL_AUTOMATION_BYPASS_SECRET is set for a localhost target. The bypass secret is ' +
          'only for preview targets and must never be sent to a local server; unset it.',
      );
    }
    return { mode: 'local', baseURL: url.origin };
  }

  if (url.protocol !== 'https:') {
    throw new Error(`E2E_BASE_URL must be https for deployed targets, got "${rawBaseURL}".`);
  }
  if (url.hostname === 'robertdelacruz.com' || url.hostname === 'www.robertdelacruz.com') {
    throw new Error(`Refusing to run e2e against production (${url.hostname}).`);
  }
  if (!url.hostname.endsWith('.vercel.app')) {
    throw new Error(
      `E2E_BASE_URL host "${url.hostname}" is not a *.vercel.app preview deployment; ` +
        'refusing to run against an arbitrary target.',
    );
  }
  if (!bypassSecret) {
    throw new Error(
      'E2E_BASE_URL targets a Vercel preview but VERCEL_AUTOMATION_BYPASS_SECRET is not set, so ' +
        `every request would land on the Deployment Protection login page. ${SECRET_SETUP_HINT}`,
    );
  }

  return { mode: 'preview', baseURL: url.origin, bypassSecret };
}

const target = resolveTarget();

// Playwright re-evaluates this config in worker processes; only the main
// process (no TEST_WORKER_INDEX) logs the resolved target.
if (process.env.TEST_WORKER_INDEX === undefined) {
  console.log(`[e2e] target: ${target.mode} mode (${new URL(target.baseURL).host})`);
}

const localPort = Number(new URL(target.baseURL).port || 3000);

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
    baseURL: target.baseURL,
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
  webServer:
    target.mode === 'local'
      ? {
          command: 'pnpm build:next && pnpm start',
          url: target.baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 300_000,
          stdout: 'pipe',
          stderr: 'pipe',
          env: {
            BLOB_BASE_URL: blobBaseURL,
            PORT: String(localPort),
          },
        }
      : undefined,
});

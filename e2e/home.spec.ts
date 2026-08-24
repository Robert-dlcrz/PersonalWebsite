import type { Page, Response } from '@playwright/test';

import { expect, test } from './fixtures';

const VERCEL_AUTH_TITLE = /log ?in|sign ?in|authentication required/i;

// Missing configuration is already rejected at config load (playwright.config.ts),
// so reaching this page means the secret itself was not accepted at runtime.
const PROTECTION_HINT = [
  'The target served a Vercel authentication page instead of the site, so the Deployment',
  'Protection bypass secret was not accepted. If the secret was rotated or regenerated in',
  'Vercel (Project → Settings → Deployment Protection → Protection Bypass for Automation),',
  'update the VERCEL_AUTOMATION_BYPASS_SECRET GitHub Actions secret to match and redeploy',
  'the preview so it picks up the new value.',
].join(' ');

/**
 * Deployment Protection turns every assertion below into a confusing "element
 * not found" failure, so surface that case first with an actionable message.
 */
async function expectSiteAndNotVercelLogin(page: Page, response: Response | null) {
  expect(response, `Navigation to ${page.url()} returned no response`).not.toBeNull();

  const status = response!.status();
  expect(status, `${PROTECTION_HINT} (HTTP ${status})`).toBeLessThan(400);

  const { hostname } = new URL(page.url());
  expect(hostname, `${PROTECTION_HINT} (redirected to ${hostname})`).not.toBe('vercel.com');

  const title = await page.title();
  expect(title, `${PROTECTION_HINT} (page title: "${title}")`).not.toMatch(VERCEL_AUTH_TITLE);
}

test('homepage renders the hero heading and the About Me, Travel, and Blog entry points', async ({
  page,
}) => {
  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expectSiteAndNotVercelLogin(page, response);

  const heading = page.getByRole('heading', { level: 1 });
  await expect(heading).toBeVisible();
  await expect(heading).toContainText('Robert De La Cruz');

  // The home cards are asserted rather than the navbar: under
  // prefers-reduced-motion the navbar settles at opacity 0, which toBeVisible()
  // does not catch, so a navbar assertion would pass without proving anything.
  for (const title of ['About Me', 'Travel', 'Blog']) {
    await expect(page.getByRole('heading', { level: 3, name: title, exact: true })).toBeVisible();
  }
});

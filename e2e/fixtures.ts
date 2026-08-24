import { test as base } from '@playwright/test';

/**
 * Specs import { test, expect } from here instead of '@playwright/test'.
 *
 * In preview mode the Vercel Deployment Protection bypass secret must reach the
 * preview deployment — and only the preview deployment. Playwright's
 * extraHTTPHeaders would attach it to every request the browser makes,
 * including third-party subresources (e.g. the Vercel Blob image host), so the
 * headers are injected per-request here and only for the preview origin.
 * x-vercel-set-bypass-cookie makes Vercel set the bypass cookie on the first
 * response so redirects and follow-up requests stay authorized.
 * See https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation
 */
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim();

// The fixture callback is conventionally named `use`, but that trips the
// react-hooks/rules-of-hooks lint rule, so it is named `provide` here.
export const test = base.extend({
  context: async ({ context, baseURL }, provide) => {
    if (bypassSecret && baseURL) {
      const previewOrigin = new URL(baseURL).origin;
      await context.route('**/*', async (route) => {
        const request = route.request();
        if (new URL(request.url()).origin !== previewOrigin) {
          return route.continue();
        }
        return route.continue({
          headers: {
            ...request.headers(),
            'x-vercel-protection-bypass': bypassSecret,
            'x-vercel-set-bypass-cookie': 'true',
          },
        });
      });
    }
    await provide(context);
  },
});

export { expect } from '@playwright/test';

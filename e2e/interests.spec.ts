import { expect, test } from './fixtures';

test('/interests shows the Luma blog-post note with a working internal link', async ({ page }) => {
  await page.goto('/interests', { waitUntil: 'domcontentloaded' });

  const note = page.locator('p', { hasText: 'Curious how the covers were generated?' });
  await expect(note).toBeVisible();

  const link = note.getByRole('link', { name: 'I wrote it up.' });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href', '/blog/using-lumas-api-to-generate-trip-covers');
});

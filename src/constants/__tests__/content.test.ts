import { describe, expect, it } from 'vitest';

import { INTERESTS_CONTENT } from '@/constants/content';

describe('INTERESTS_CONTENT.coverNote', () => {
  it('contains the expected copy and internal blog link', () => {
    expect(INTERESTS_CONTENT.coverNote).toEqual({
      text: 'Curious how the covers were generated?',
      linkLabel: 'I wrote it up.',
      href: '/blog/using-lumas-api-to-generate-trip-covers',
    });
  });

  it('href is an internal path, not an absolute URL', () => {
    expect(INTERESTS_CONTENT.coverNote.href).toMatch(/^\//);
    expect(INTERESTS_CONTENT.coverNote.href).not.toMatch(/^https?:\/\//);
  });
});

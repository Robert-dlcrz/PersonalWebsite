import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';

import { BlogMarkdown } from '@/components/blog-layouts/BlogMarkdown';

type RenderedHtmlProps = {
  dangerouslySetInnerHTML: { __html: string };
};

async function renderToHtml(markdown: string): Promise<string> {
  const element = (await BlogMarkdown({ markdown, slug: 'test-post' })) as ReactElement<RenderedHtmlProps>;
  return element.props.dangerouslySetInnerHTML.__html;
}

describe('BlogMarkdown sanitization', () => {
  it('strips javascript: URIs from author links', async () => {
    const html = await renderToHtml('[click me](javascript:alert(1))');

    expect(html).not.toContain('javascript:');
  });

  it('drops raw event-handler attributes and script tags', async () => {
    const html = await renderToHtml('<img src="x" onerror="alert(1)">\n\n<script>alert(1)</script>');

    expect(html).not.toContain('onerror');
    expect(html).not.toContain('<script');
  });

  it('keeps heading ids unclobbered so the table-of-contents anchors work', async () => {
    const html = await renderToHtml('## My Section Title');

    expect(html).toContain('id="my-section-title"');
    expect(html).not.toContain('user-content-');
  });

  it('preserves syntax highlighting metadata on fenced code blocks', async () => {
    const html = await renderToHtml('```js\nconst answer = 42;\n```');

    expect(html).toContain('data-language="js"');
  });
});

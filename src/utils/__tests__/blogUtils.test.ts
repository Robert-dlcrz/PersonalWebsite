import { describe, expect, it, vi } from 'vitest';
import type { Element, Root } from 'hast';

import { extractSections, rewriteRelativeImages } from '@/utils/blogUtils';
import { registerBlobEnvTestHooks } from './blobEnvTestSetup';

describe('extractSections', () => {
  it('returns no sections when there is no h2 heading', () => {
    // given
    const empty = '';
    const onlyH1 = '# Only h1';

    // when
    const emptyResult = extractSections(empty);
    const h1Result = extractSections(onlyH1);

    // then
    expect(emptyResult).toEqual([]);
    expect(h1Result).toEqual([]);
  });

  it('returns one section per ## heading with slug id', () => {
    // given
    const markdown = '## Hello';

    // when
    const result = extractSections(markdown);

    // then
    expect(result).toEqual([{ id: 'hello', text: 'Hello' }]);
  });

  it('ignores ### and deeper headings', () => {
    // given
    const markdown = '### Deep';

    // when
    const result = extractSections(markdown);

    // then
    expect(result).toEqual([]);
  });

  it('does not treat ## inside fenced code as a section', () => {
    // given
    const markdown = '```\n## Fake\n```\n\n## Real\n';

    // when
    const result = extractSections(markdown);

    // then
    expect(result).toEqual([{ id: 'real', text: 'Real' }]);
  });

  it('ignores ## headings with no visible text after trim', () => {
    // given — whitespace-only heading should not become a TOC entry
    const markdown = '##   \n\n## Visible\n';

    // when
    const result = extractSections(markdown);

    // then
    expect(result).toEqual([{ id: 'visible', text: 'Visible' }]);
  });
});

function element(tagName: string, properties: Element['properties'], children: Element['children'] = []): Element {
  return { type: 'element', tagName, properties, children };
}

describe('rewriteRelativeImages', () => {
  registerBlobEnvTestHooks();

  function runPlugin(slug: string, tree: Root) {
    const plugin = rewriteRelativeImages(slug);
    plugin()(tree);
  }

  it('does not change non-img elements', () => {
    // given
    const tree: Root = {
      type: 'root',
      children: [element('div', { src: './x.jpg' })],
    };

    // when
    runPlugin('post', tree);

    // then
    expect((tree.children[0] as Element).properties?.src).toBe('./x.jpg');
  });

  it('does not change img when src is not a string', () => {
    // given
    const tree: Root = {
      type: 'root',
      children: [element('img', { src: true })],
    };

    // when
    runPlugin('post', tree);

    // then
    expect((tree.children[0] as Element).properties?.src).toBe(true);
  });

  it('does not change img with absolute http(s) src', () => {
    // given
    const tree: Root = {
      type: 'root',
      children: [element('img', { src: 'https://example.com/a.png' })],
    };

    // when
    runPlugin('post', tree);

    // then
    expect((tree.children[0] as Element).properties?.src).toBe('https://example.com/a.png');
  });

  it('does not rewrite unsafe ./ relative paths', () => {
    // given
    const tree: Root = {
      type: 'root',
      children: [element('img', { src: './../evil.jpg' })],
    };

    // when
    runPlugin('post', tree);

    // then
    expect((tree.children[0] as Element).properties?.src).toBe('./../evil.jpg');
  });

  it('rewrites safe ./ paths using resolveBlobUrl', () => {
    // given
    vi.stubEnv('BLOB_BASE_URL', 'https://blob.test');
    const tree: Root = {
      type: 'root',
      children: [element('img', { src: './images/x.jpg' })],
    };

    // when
    runPlugin('my-slug', tree);

    // then
    expect((tree.children[0] as Element).properties?.src).toBe(
      'https://blob.test/blog/my-slug/images/x.jpg',
    );
  });
});

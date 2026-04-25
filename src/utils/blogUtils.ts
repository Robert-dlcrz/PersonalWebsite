import GithubSlugger from 'github-slugger';
import { toString as mdastToString } from 'mdast-util-to-string';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import type { Root, Heading } from 'mdast';
import type { Element, Root as HastRoot } from 'hast';

import type { BlogTableOfContentsSection } from '@/model/BlogTableOfContentsSection';
import { resolveBlobUrl } from '@/utils/blob';

const RELATIVE_IMAGE_PREFIX = './';
const IMG_TAG = 'img';

/**
 * Parse markdown source and return one table-of-contents entry per top-level
 * section (`## ...` headings). The generated id uses the same `github-slugger`
 * algorithm that `rehype-slug` applies when rendering, so the rail anchors
 * match the DOM anchors emitted by the server-rendered headings.
 *
 * Using an AST walk (instead of a line-by-line regex) is deliberate: it
 * correctly skips `##` sequences that appear inside fenced code blocks.
 */
export function extractSections(markdown: string): BlogTableOfContentsSection[] {
  const tree = unified().use(remarkParse).parse(markdown) as Root;
  const slugger = new GithubSlugger();
  const sections: BlogTableOfContentsSection[] = [];

  visit(tree, 'heading', (node: Heading) => {
    if (node.depth !== 2) {
      return;
    }
    const text = mdastToString(node).trim();
    if (!text) {
      return;
    }
    sections.push({ id: slugger.slug(text), text });
  });

  return sections;
}

/**
 * Keep authored `./...` image paths scoped to the current post's Blob folder.
 */
function isSafeRelativeImagePath(path: string): boolean {
  return path
    .split('/')
    .every((segment) => segment.length > 0 && segment !== '.' && segment !== '..');
}

/**
 * Rehype plugin factory that rewrites `./relative/path.jpg` image sources in a
 * blog post's rendered HTML to absolute Vercel Blob URLs scoped under
 * `blog/<slug>/`. This lets authors use natural markdown image syntax
 * (`![alt](./images/foo.jpg)`) inside `post.md` without hardcoding the blob host.
 *
 * Only `./`-prefixed paths are rewritten; absolute URLs and `/`-rooted paths
 * are left alone so we never accidentally mangle intentional links.
 *
 * @example For slug `my-post`, an `<img src="./images/hero.jpg">` node becomes
 * `src` = `resolveBlobUrl("blog/my-post/images/hero.jpg")`, i.e. your blob base
 * URL + `/blog/my-post/images/hero.jpg`.
 */
export function rewriteRelativeImages(slug: string) {
  const postPrefix = `blog/${slug}/`;

  return () => (tree: HastRoot) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== IMG_TAG) {
        return;
      }
      const src = node.properties?.src;
      if (typeof src !== 'string' || !src.startsWith(RELATIVE_IMAGE_PREFIX)) {
        return;
      }
      const relativePath = src.slice(RELATIVE_IMAGE_PREFIX.length);
      if (!isSafeRelativeImagePath(relativePath)) {
        return;
      }
      node.properties = {
        ...node.properties,
        src: resolveBlobUrl(`${postPrefix}${relativePath}`),
      };
    });
  };
}

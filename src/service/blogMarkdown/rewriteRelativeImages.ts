import { visit } from 'unist-util-visit';
import type { Element, Root } from 'hast';

import { resolveBlobUrl } from '@/utils/blob';

const RELATIVE_IMAGE_PREFIX = './';

/**
 * Rehype plugin factory that rewrites `./relative/path.jpg` image sources in a
 * blog post's rendered HTML to absolute Vercel Blob URLs scoped under
 * `blog/<slug>/`. This lets authors use natural markdown image syntax
 * (`![alt](./images/foo.jpg)`) inside `post.md` without hardcoding the blob host.
 *
 * Only `./`-prefixed paths are rewritten; absolute URLs and `/`-rooted paths
 * are left alone so we never accidentally mangle intentional links.
 */
export function rewriteRelativeImages(slug: string) {
  const postPrefix = `blog/${slug}/`;

  return () => (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'img') {
        return;
      }
      const src = node.properties?.src;
      if (typeof src !== 'string' || !src.startsWith(RELATIVE_IMAGE_PREFIX)) {
        return;
      }
      const relativePath = src.slice(RELATIVE_IMAGE_PREFIX.length);
      node.properties = {
        ...node.properties,
        src: resolveBlobUrl(`${postPrefix}${relativePath}`),
      };
    });
  };
}

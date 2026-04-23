import type { BlogPostRecord } from './BlogPostRecord';

/**
 * A single h2 section in a blog post, used to build the floating TOC rail.
 * `id` must match the anchor id that `rehype-slug` assigns to the rendered
 * heading element so click-to-scroll and IntersectionObserver hand-off work.
 */
export type BlogTocSection = {
  id: string;
  text: string;
};

/**
 * Fully resolved blog post returned by the `BlogService`.
 * Combines raw frontmatter with the markdown body and the pre-extracted TOC.
 */
export type BlogPost = BlogPostRecord & {
  slug: string;
  markdown: string;
  sections: BlogTocSection[];
};

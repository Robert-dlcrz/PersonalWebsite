import type { BlogPostRecord } from './BlogPostRecord';
import type { BlogTableOfContentsSection } from './BlogTableOfContentsSection';

/**
 * Fully resolved blog post returned by the `BlogService`.
 * Combines raw frontmatter with the markdown body and the pre-extracted table of
 * contents.
 */
export type BlogPost = BlogPostRecord & {
  slug: string;
  markdown: string;
  sections: BlogTableOfContentsSection[];
};

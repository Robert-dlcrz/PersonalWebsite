import type { BlogPostRecord } from './BlogPostRecord';

/**
 * One entry in `blog/blog_index.json`: the same frontmatter fields as a post
 * (`BlogPostRecord`) plus `slug`, used for the blog index, navigation, and
 * `generateStaticParams` without loading each `post.md`.
 */
export type BlogPostSummary = BlogPostRecord & {
  slug: string;
};

/**
 * Raw blog post frontmatter as authored in Vercel Blob `post.md` files.
 *
 * Keep this minimal and serialization-friendly. Derived fields (resolved image
 * URLs, extracted TOC sections, etc.) live on higher-level types like `BlogPost`.
 */
export type BlogPostRecord = {
  title: string;
  date: string;
  excerpt?: string;
  tags?: string[];
};

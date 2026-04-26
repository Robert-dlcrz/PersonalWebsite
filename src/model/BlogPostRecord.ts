/**
 * Raw blog post frontmatter as authored in Vercel Blob `post.md` files.
 *
 * Keep this minimal and serialization-friendly. Derived fields (resolved image
 * URLs, extracted table-of-contents sections, etc.) live on higher-level types like `BlogPost`.
 *
 * Stay a plain `type` (not a class) so `BlogPost` / `BlogPostSummary` use simple
 * `&` intersections — no `Pick<…>` layer and no class instance assignability issues.
 */
export type BlogPostRecord = {
  title: string;
  date: string;
  excerpt: string;
};

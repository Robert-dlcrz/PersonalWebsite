/**
 * A single h2 section in a blog post, used to build the floating table of
 * contents rail. `id` must match the anchor id that `rehype-slug` assigns to the
 * rendered heading element so click-to-scroll and IntersectionObserver hand-off work.
 */
export type BlogTableOfContentsSection = {
  id: string;
  text: string;
};

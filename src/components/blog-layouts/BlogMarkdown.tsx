import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

import { rewriteRelativeImages } from '@/service/blogMarkdown/rewriteRelativeImages';

type BlogMarkdownProps = {
  markdown: string;
  slug: string;
};

const PRETTY_CODE_OPTIONS = {
  theme: 'github-dark',
  keepBackground: true,
} as const;

/**
 * Server-rendered markdown surface for blog posts.
 *
 * We drive the pipeline with `unified` directly (rather than `react-markdown`)
 * because `rehype-pretty-code` is async and `react-markdown` only supports
 * synchronous plugins. Running server-side means shiki never ships to the
 * client bundle; the output is pure HTML that the client hydrates as-is.
 *
 * Element-level typography lives in [src/app/globals.css](src/app/globals.css)
 * under `.blog-markdown` selectors. That keeps the rendering path simple and
 * makes it trivial to evolve the styling without touching the pipeline.
 */
export async function BlogMarkdown({ markdown, slug }: BlogMarkdownProps) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rewriteRelativeImages(slug))
    .use(rehypePrettyCode, PRETTY_CODE_OPTIONS)
    .use(rehypeStringify)
    .process(markdown);

  const html = String(file);

  return (
    <div
      className="blog-markdown"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

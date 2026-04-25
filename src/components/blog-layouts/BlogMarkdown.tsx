import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

import { rewriteRelativeImages } from '@/utils/blogUtils';
import styles from './BlogMarkdown.module.css';

type BlogMarkdownProps = {
  markdown: string;
  slug: string;
};

const PRETTY_CODE_OPTIONS = {
  theme: 'github-dark',
  keepBackground: true,
} as const;

// The unified pipeline stays server-side so Shiki and markdown parsing do not
// ship to the browser.
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
      className={styles.markdown}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

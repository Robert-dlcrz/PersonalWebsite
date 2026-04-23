import GithubSlugger from 'github-slugger';
import { toString as mdastToString } from 'mdast-util-to-string';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import type { Root, Heading } from 'mdast';

import type { BlogTocSection } from '@/model/BlogPost';

/**
 * Parse markdown source and return one TOC entry per top-level section
 * (`## ...` headings). The generated id uses the same `github-slugger`
 * algorithm that `rehype-slug` applies when rendering, so the rail anchors
 * match the DOM anchors emitted by the server-rendered headings.
 *
 * Using an AST walk (instead of a line-by-line regex) is deliberate: it
 * correctly skips `##` sequences that appear inside fenced code blocks.
 */
export function extractSections(markdown: string): BlogTocSection[] {
  const tree = unified().use(remarkParse).parse(markdown) as Root;
  const slugger = new GithubSlugger();
  const sections: BlogTocSection[] = [];

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

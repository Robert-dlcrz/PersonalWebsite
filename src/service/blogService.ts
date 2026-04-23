import matter from 'gray-matter';

import { BlobClient } from '@/persistence/blobClient';
import type { BlogPost } from '@/model/BlogPost';
import type { BlogPostRecord } from '@/model/BlogPostRecord';
import { extractSections } from '@/service/blogMarkdown/extractSections';

const DEFAULT_REVALIDATE_SECONDS = 60 * 10; // 10 minutes
const BLOG_POST_PATH = (slug: string) => `blog/${slug}/post.md`;

/**
 * gray-matter parses YAML dates into `Date` instances. We normalize to an
 * ISO-like string here so the downstream UI only needs to handle strings
 * and server-to-client serialization stays straightforward.
 */
function coerceDate(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === 'string') {
    return value;
  }
  throw new Error('BlogService: frontmatter `date` must be a date or string');
}

function parseFrontmatter(source: string): { record: BlogPostRecord; body: string } {
  const { data, content } = matter(source);

  if (typeof data.title !== 'string' || data.title.length === 0) {
    throw new Error('BlogService: frontmatter is missing a `title`');
  }

  const record: BlogPostRecord = {
    title: data.title,
    date: coerceDate(data.date),
    excerpt: typeof data.excerpt === 'string' ? data.excerpt : undefined,
    tags: Array.isArray(data.tags) ? data.tags.filter((tag): tag is string => typeof tag === 'string') : undefined,
  };

  return { record, body: content };
}

/**
 * Service for handling blog-post data operations.
 * Mirrors `TripService`: uses the generic `BlobClient` and is exposed as a
 * singleton via `blogService`.
 */
export class BlogService {
  private readonly client: BlobClient;

  constructor(client = new BlobClient()) {
    this.client = client;
  }

  /**
   * Fetch a single post by slug. Parses the YAML frontmatter, extracts the
   * h2 sections for the floating TOC, and returns both the raw markdown body
   * (to be rendered server-side by `BlogMarkdown`) and the derived metadata.
   */
  async fetchPost(slug: string): Promise<BlogPost> {
    const source = await this.client.getText(BLOG_POST_PATH(slug), {
      revalidateSeconds: DEFAULT_REVALIDATE_SECONDS,
    });

    const { record, body } = parseFrontmatter(source);
    const sections = extractSections(body);

    return {
      ...record,
      slug,
      markdown: body,
      sections,
    };
  }
}

const BLOG_SERVICE_KEY = '__blogService';

type GlobalWithBlogService = typeof globalThis & {
  [BLOG_SERVICE_KEY]?: BlogService;
};

const globalWithBlogService = globalThis as GlobalWithBlogService;

/**
 * Singleton instance of BlogService.
 * Ensures we only create one BlogService per Node/Next worker.
 * During dev hot reloads this guard prevents multiple instances.
 */
export const blogService =
  globalWithBlogService[BLOG_SERVICE_KEY] ?? (globalWithBlogService[BLOG_SERVICE_KEY] = new BlogService());

declare global {
  var __blogService: BlogService | undefined;
}

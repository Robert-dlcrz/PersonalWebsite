import matter from 'gray-matter';

import { BlobClient } from '@/persistence/blobClient';
import type { BlogPost } from '@/model/BlogPost';
import type { BlogPostRecord } from '@/model/BlogPostRecord';
import type { BlogPostSummary } from '@/model/BlogPostSummary';
import { extractSections } from '@/utils/blogUtils';
import { coerceDate } from '@/utils/dateUtils';

const DEFAULT_REVALIDATE_SECONDS = 60 * 10; // 10 minutes
const BLOG_INDEX_PATH = 'blog/blog_index.json';
const BLOG_POST_PATH = (slug: string) => `blog/${slug}/post.md`;

function parseFrontmatter(source: string): { record: BlogPostRecord; body: string } {
  const { data, content } = matter(source);

  const record: BlogPostRecord = {
    title: typeof data.title === 'string' ? data.title : '',
    date: coerceDate(data.date),
    excerpt: typeof data.excerpt === 'string' ? data.excerpt : '',
  };

  return { record, body: content };
}

/**
 * Service for handling blog-post data operations.
 * Mirrors `TripService`: uses the generic `BlobClient` and is exposed as a
 * singleton via `blogService`.
 */
export class BlogService {
  static readonly BLOG_INDEX_PATH = BLOG_INDEX_PATH;

  private readonly client: BlobClient;

  constructor(client = new BlobClient()) {
    this.client = client;
  }

  async fetchPostSummaries(): Promise<BlogPostSummary[]> {
    const posts = await this.client.getJson<BlogPostSummary[]>(BLOG_INDEX_PATH, {
      revalidateSeconds: DEFAULT_REVALIDATE_SECONDS,
    });

    return posts;
  }

  /**
   * Fetch a single post by slug. Parses the YAML frontmatter, extracts the
   * h2 sections for the floating table of contents, and returns both the raw markdown body
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

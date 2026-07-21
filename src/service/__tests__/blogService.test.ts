import { afterEach, describe, expect, it, vi } from 'vitest';

import { BlobFetchError } from '@/persistence/blobClient';
import type { BlogPostSummary } from '@/model/BlogPostSummary';
import {
  BlogService,
  fetchPostSummariesOrEmpty,
  isMissingBlogIndexError,
} from '@/service/blogService';

function makeSummary(overrides: Partial<BlogPostSummary> & Pick<BlogPostSummary, 'slug' | 'date'>): BlogPostSummary {
  return {
    title: overrides.title ?? overrides.slug,
    excerpt: overrides.excerpt ?? 'excerpt',
    ...overrides,
  };
}

describe('BlogService.fetchPostSummaries', () => {
  it('returns posts sorted by date descending without mutating the source array', async () => {
    const unsorted = [
      makeSummary({ slug: 'older', date: '2026-01-01', title: 'Older' }),
      makeSummary({ slug: 'newer', date: '2026-05-11', title: 'Newer' }),
      makeSummary({ slug: 'middle', date: '2026-03-15', title: 'Middle' }),
    ];
    const source = [...unsorted];

    const getJson = vi.fn().mockResolvedValue(unsorted);
    const service = new BlogService({ getJson } as never);

    const result = await service.fetchPostSummaries();

    expect(result.map((post) => post.slug)).toEqual(['newer', 'middle', 'older']);
    expect(unsorted).toEqual(source);
    expect(getJson).toHaveBeenCalledWith('blog/blog_index.json', {
      revalidateSeconds: 60 * 10,
    });
  });
});

describe('isMissingBlogIndexError', () => {
  it('returns true for a 404 on the blog index path', () => {
    const error = new BlobFetchError(BlogService.BLOG_INDEX_PATH, 404, 'Not Found');
    expect(isMissingBlogIndexError(error)).toBe(true);
  });

  it('returns false for the wrong pathname', () => {
    const error = new BlobFetchError('blog/other.json', 404, 'Not Found');
    expect(isMissingBlogIndexError(error)).toBe(false);
  });

  it('returns false for a non-404 status', () => {
    const error = new BlobFetchError(BlogService.BLOG_INDEX_PATH, 500, 'Error');
    expect(isMissingBlogIndexError(error)).toBe(false);
  });

  it('returns false for a generic Error', () => {
    expect(isMissingBlogIndexError(new Error('boom'))).toBe(false);
  });
});

describe('fetchPostSummariesOrEmpty', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns summaries from the service on success', async () => {
    const posts = [makeSummary({ slug: 'five-ai-workflows', date: '2026-05-11' })];
    const service = {
      fetchPostSummaries: vi.fn().mockResolvedValue(posts),
    } as unknown as BlogService;

    await expect(fetchPostSummariesOrEmpty(service)).resolves.toEqual(posts);
  });

  it('returns an empty list when the blog index is missing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const service = {
      fetchPostSummaries: vi
        .fn()
        .mockRejectedValue(new BlobFetchError(BlogService.BLOG_INDEX_PATH, 404, 'Not Found')),
    } as unknown as BlogService;

    await expect(fetchPostSummariesOrEmpty(service)).resolves.toEqual([]);
    expect(warn).toHaveBeenCalled();
  });

  it('rethrows unrelated errors', async () => {
    const service = {
      fetchPostSummaries: vi
        .fn()
        .mockRejectedValue(new BlobFetchError(BlogService.BLOG_INDEX_PATH, 500, 'Error')),
    } as unknown as BlogService;

    await expect(fetchPostSummariesOrEmpty(service)).rejects.toBeInstanceOf(BlobFetchError);
  });
});

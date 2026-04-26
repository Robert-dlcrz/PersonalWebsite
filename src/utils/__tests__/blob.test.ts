import { describe, expect, it, vi } from 'vitest';

import { resolveBlobUrl } from '@/utils/blob';
import { registerBlobEnvTestHooks } from './blobEnvTestSetup';

registerBlobEnvTestHooks();

describe('resolveBlobUrl', () => {
  it('returns http(s) URLs unchanged', () => {
    // given
    const httpsPath = 'https://example.com/x';
    const httpPath = 'http://example.com/y';

    // when
    const httpsResult = resolveBlobUrl(httpsPath);
    const httpResult = resolveBlobUrl(httpPath);

    // then
    expect(httpsResult).toBe('https://example.com/x');
    expect(httpResult).toBe('http://example.com/y');
  });

  it('joins pathname to BLOB_BASE_URL and strips slashes', () => {
    // given
    vi.stubEnv('BLOB_BASE_URL', 'https://blob.test/');

    // when
    const leadingSlash = resolveBlobUrl('/blog/foo.jpg');
    const bare = resolveBlobUrl('blog/foo.jpg');

    // then
    expect(leadingSlash).toBe('https://blob.test/blog/foo.jpg');
    expect(bare).toBe('https://blob.test/blog/foo.jpg');
  });

  it('throws when no blob base env is set', () => {
    // given
    const pathname = 'blog/x.jpg';

    // when / then
    expect(() => resolveBlobUrl(pathname)).toThrow('Missing blob base URL');
  });
});

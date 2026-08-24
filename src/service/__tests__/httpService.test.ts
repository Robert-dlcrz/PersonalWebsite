import { afterEach, describe, expect, it, vi, type Mock } from 'vitest';

import type { HttpClient } from '@/persistence/httpClient';
import { HttpError, HttpService } from '@/service/httpService';

const OUTPUT_URL = 'https://storage.example.com/generations/d290f1ee/output.png?X-Amz-Expires=3600';

function imageResponse(contentType = 'image/png', status = 200): Response {
  return new Response(new Uint8Array([1, 2, 3]), {
    status,
    headers: { 'content-type': contentType },
  });
}

// Typed with the real client signature so the stub satisfies HttpClient structurally.
function requestMock(): Mock<HttpClient['request']> {
  return vi.fn<HttpClient['request']>();
}

function makeService(request: Mock<HttpClient['request']>) {
  return new HttpService({ request });
}

function stubFetch(impl: ReturnType<typeof vi.fn>) {
  vi.stubGlobal('fetch', impl);
  return impl;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('HttpService.download', () => {
  it('GETs the URL with a 25s deadline and returns bytes plus content-type', async () => {
    const request = requestMock().mockResolvedValue(imageResponse('image/jpeg'));
    const service = makeService(request);

    const result = await service.download(OUTPUT_URL);

    expect(request).toHaveBeenCalledWith(OUTPUT_URL, { signal: expect.any(AbortSignal) });
    expect(result.contentType).toBe('image/jpeg');
    expect(result.bytes).toEqual(Buffer.from([1, 2, 3]));
  });

  it('maps a non-2xx response to HttpError carrying the status', async () => {
    const service = makeService(requestMock().mockResolvedValue(imageResponse('image/png', 403)));

    await expect(service.download(OUTPUT_URL)).rejects.toMatchObject({
      name: 'HttpError',
      status: 403,
    });
  });

  it('wraps a raw client throw (including abort) in HttpError', async () => {
    // Node's AbortSignal.timeout is not driven by Vitest fake timers.
    vi.spyOn(AbortSignal, 'timeout').mockReturnValue(AbortSignal.abort());
    const cause = new DOMException('The operation was aborted.', 'AbortError');
    const request = requestMock().mockRejectedValue(cause);
    const service = makeService(request);

    await expect(service.download(OUTPUT_URL)).rejects.toMatchObject({
      name: 'HttpError',
      status: undefined,
      cause,
    });
    expect(AbortSignal.timeout).toHaveBeenCalledWith(25_000);
    expect(request).toHaveBeenCalledWith(OUTPUT_URL, { signal: expect.any(AbortSignal) });
  });

  it('is an instance of HttpError (route narrows with instanceof)', async () => {
    const service = makeService(requestMock().mockResolvedValue(imageResponse('image/png', 500)));

    await expect(service.download(OUTPUT_URL)).rejects.toBeInstanceOf(HttpError);
  });
});

// exists() goes through the real HttpClient with global fetch stubbed, so the
// HEAD / ranged-GET wire shape is under test, not a hand-rolled client stub.
describe('HttpService.exists', () => {
  const URL_A = 'https://storage.example.com/a.png';
  const URL_B = 'https://storage.example.com/b.png';

  it('HEADs each URL with a 5s deadline and reports ok for 2xx', async () => {
    const fetchMock = stubFetch(vi.fn().mockResolvedValue(new Response(null, { status: 200 })));
    const service = new HttpService();

    const results = await service.exists([URL_A, URL_B]);

    expect(results).toEqual([
      { url: URL_A, ok: true },
      { url: URL_B, ok: true },
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith(
      URL_A,
      expect.objectContaining({ method: 'HEAD', signal: expect.any(AbortSignal) }),
    );
  });

  it('reports a non-2xx status as a status_ reason without throwing', async () => {
    stubFetch(vi.fn().mockResolvedValue(new Response(null, { status: 403 })));

    const results = await new HttpService().exists([URL_A]);

    expect(results).toEqual([{ url: URL_A, ok: false, reason: 'status_403' }]);
  });

  it('reports a thrown fetch (timeout, DNS, refused) as unreachable_or_timeout', async () => {
    stubFetch(vi.fn().mockRejectedValue(new DOMException('aborted', 'TimeoutError')));

    const results = await new HttpService().exists([URL_A]);

    expect(results).toEqual([{ url: URL_A, ok: false, reason: 'unreachable_or_timeout' }]);
  });

  it('falls back to a zero-byte ranged GET when the host rejects HEAD', async () => {
    const fetchMock = stubFetch(
      vi
        .fn()
        .mockResolvedValueOnce(new Response(null, { status: 405 }))
        .mockResolvedValueOnce(new Response(null, { status: 206 })),
    );

    const results = await new HttpService().exists([URL_A]);

    expect(results).toEqual([{ url: URL_A, ok: true }]);
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      URL_A,
      expect.objectContaining({ method: 'GET', headers: { range: 'bytes=0-0' } }),
    );
  });

  it('returns one result per input URL in input order', async () => {
    stubFetch(
      vi.fn().mockImplementation(async (url: string) => {
        return new Response(null, { status: url === URL_A ? 404 : 200 });
      }),
    );

    const results = await new HttpService().exists([URL_A, URL_B]);

    expect(results).toEqual([
      { url: URL_A, ok: false, reason: 'status_404' },
      { url: URL_B, ok: true },
    ]);
  });

  it('returns an empty array for no URLs without touching the network', async () => {
    const fetchMock = stubFetch(vi.fn());

    await expect(new HttpService().exists([])).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

import { HttpClient } from '@/persistence/httpClient';

/**
 * 25s, not the leftover ~30s after the 270s poll: a hung download must fail
 * as a typed error, not eat `maxDuration` and die with no response.
 */
const DOWNLOAD_TIMEOUT_MS = 25_000;

/** Existence probes are cheap HEADs; fail fast rather than eat the budget. */
const EXISTS_TIMEOUT_MS = 5_000;

/**
 * Typed download failure. Carries the HTTP status when the server responded;
 * network / abort failures have no status.
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number | undefined,
    public readonly cause?: unknown,
  ) {
    super(`HttpService: download failed (status ${status ?? 'unknown'})`);
    this.name = 'HttpError';
  }
}

export type UrlExistenceFailureReason = `status_${number}` | 'unreachable_or_timeout';

export type UrlExistenceResult =
  | { url: string; ok: true }
  | { url: string; ok: false; reason: UrlExistenceFailureReason };

/**
 * Domain service for one-shot HTTP downloads and existence checks. The client
 * is the raw fetch; this layer owns deadlines, treats non-2xx as failure, and
 * returns typed results.
 */
export class HttpService {
  private readonly http: HttpClient;

  constructor(http = new HttpClient()) {
    this.http = http;
  }

  async download(url: string): Promise<{ bytes: Buffer; contentType: string | null }> {
    let response: Response;
    try {
      response = await this.http.request(url, {
        signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
      });
    } catch (cause) {
      throw new HttpError(undefined, cause);
    }
    if (!response.ok) {
      throw new HttpError(response.status);
    }
    return {
      bytes: Buffer.from(await response.arrayBuffer()),
      contentType: response.headers.get('content-type'),
    };
  }

  /**
   * Existence probe for a batch of URLs: HEAD each (zero-byte ranged GET when
   * the host rejects HEAD), 5s deadline apiece. Returns one result per input
   * URL in input order and never throws for a missing URL — callers that need
   * all-or-nothing inspect the array.
   */
  async exists(urls: string[]): Promise<UrlExistenceResult[]> {
    return Promise.all(urls.map((url) => this.existsOne(url)));
  }

  private async existsOne(url: string): Promise<UrlExistenceResult> {
    try {
      let response = await this.http.request(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(EXISTS_TIMEOUT_MS),
      });
      if (response.status === 405 || response.status === 501) {
        // Host rejects HEAD; probe with a zero-byte ranged GET instead.
        response = await this.http.request(url, {
          method: 'GET',
          headers: { range: 'bytes=0-0' },
          signal: AbortSignal.timeout(EXISTS_TIMEOUT_MS),
        });
      }
      if (!response.ok) {
        return { url, ok: false, reason: `status_${response.status}` };
      }
      return { url, ok: true };
    } catch {
      return { url, ok: false, reason: 'unreachable_or_timeout' };
    }
  }
}

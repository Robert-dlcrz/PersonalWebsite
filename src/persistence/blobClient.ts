import { list, put, type ListBlobResult, type PutBlobResult } from '@vercel/blob';
import { resolveBlobUrl } from '@/utils/blob';

type GetOptions = {
  revalidateSeconds?: number;
};

type PutOptions = {
  contentType?: string;
};

export class BlobFetchError extends Error {
  constructor(
    public readonly pathname: string,
    public readonly status: number,
    public readonly statusText: string,
  ) {
    super(`BlobClient: failed to fetch ${pathname} (${status} ${statusText})`);
    this.name = 'BlobFetchError';
  }
}

/**
 * TODO: split this into a persistence client (raw SDK wrap that logs and
 * rethrows) and a BlobService (path conventions, typed errors). It currently
 * does both.
 */
export class BlobClient {
  constructor(private readonly defaultRevalidateSeconds = 60 * 10) {}

  /**
   * Core fetch used by the typed helpers. Centralizes URL resolution, the
   * Next.js revalidate hint, and the not-OK error so the public methods only
   * differ in how they decode the response body.
   */
  private async fetchBlob(pathname: string, options?: GetOptions): Promise<Response> {
    const url = resolveBlobUrl(pathname);
    const response = await fetch(url, {
      next: { revalidate: options?.revalidateSeconds ?? this.defaultRevalidateSeconds },
    });

    if (!response.ok) {
      throw new BlobFetchError(pathname, response.status, response.statusText);
    }

    return response;
  }

  async getJson<T>(pathname: string, options?: GetOptions): Promise<T> {
    const response = await this.fetchBlob(pathname, options);
    return (await response.json()) as T;
  }

  async getText(pathname: string, options?: GetOptions): Promise<string> {
    const response = await this.fetchBlob(pathname, options);
    return response.text();
  }

  async listBlobs(prefix: string): Promise<ListBlobResult> {
    return list({
      prefix,
      token: process.env.ROBDLC_PERSONAL_WEBSITE_READ_WRITE_TOKEN,
    });
  }

  /**
   * Raw write to the Blob store, mirroring the onboarding script's settings
   * (public access, stable pathname). Logs the pathname and rethrows failures;
   * callers own any domain-level wrapping of the error.
   */
  async putBlob(pathname: string, body: Buffer, options?: PutOptions): Promise<PutBlobResult> {
    try {
      const result = await put(pathname, body, {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: options?.contentType,
        token: process.env.ROBDLC_PERSONAL_WEBSITE_READ_WRITE_TOKEN,
      });
      console.log(`BlobClient: put ok pathname=${pathname} bytes=${body.byteLength}`);
      return result;
    } catch (error) {
      console.error(`BlobClient: put failed pathname=${pathname}`, error);
      throw error;
    }
  }
}

import { list, type ListBlobResult } from '@vercel/blob';
import { resolveBlobUrl } from '@/utils/blob';

type GetOptions = {
  revalidateSeconds?: number;
};

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
      throw new Error(`BlobClient: failed to fetch ${pathname}`);
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
}

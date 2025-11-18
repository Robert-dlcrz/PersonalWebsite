import { list, type ListBlobResult } from '@vercel/blob';
import { resolveBlobUrl } from '@/utils/blob';

type GetJsonOptions = {
  revalidateSeconds?: number;
};

export class BlobClient {
  constructor(private readonly defaultRevalidateSeconds = 60 * 10) {}

  async getJson<T>(pathname: string, options?: GetJsonOptions): Promise<T> {
    const url = resolveBlobUrl(pathname);
    const response = await fetch(url, {
      next: { revalidate: options?.revalidateSeconds ?? this.defaultRevalidateSeconds },
    });

    if (!response.ok) {
      throw new Error(`BlobClient: failed to fetch JSON at ${pathname}`);
    }

    return (await response.json()) as T;
  }

  async listBlobs(prefix: string): Promise<ListBlobResult> {
    return list({ prefix });
  }
}
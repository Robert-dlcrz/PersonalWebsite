const ABSOLUTE_URL_REGEX = /^https?:\/\//i;

function sanitizePathname(pathname: string) {
  return pathname.replace(/^\/+/, '');
}

/**
 * TODO: Add unit tests
 */
export function resolveBlobUrl(pathname: string): string {
  if (ABSOLUTE_URL_REGEX.test(pathname)) {
    return pathname;
  }

  const base =
    process.env.BLOB_BASE_URL ??
    process.env.NEXT_PUBLIC_BLOB_BASE_URL ??
    process.env.BLOB_PUBLIC_BASE_URL;

  if (!base) {
    throw new Error(
      'Missing blob base URL. Set BLOB_BASE_URL (or NEXT_PUBLIC_BLOB_BASE_URL) to your Vercel Blob store domain.'
    );
  }

  const normalizedBase = base.replace(/\/+$/, '');
  const normalizedPath = sanitizePathname(pathname);

  return `${normalizedBase}/${normalizedPath}`;
}


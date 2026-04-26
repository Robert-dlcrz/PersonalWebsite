import { afterEach, beforeEach, vi } from 'vitest';

export const BLOB_ENV_KEYS = ['BLOB_BASE_URL', 'NEXT_PUBLIC_BLOB_BASE_URL', 'BLOB_PUBLIC_BASE_URL'] as const;

export function stubAllBlobEnvEmpty(): void {
  for (const key of BLOB_ENV_KEYS) {
    vi.stubEnv(key, '');
  }
}

/** Registers file- or describe-scoped hooks so blob-related env vars start empty each test. */
export function registerBlobEnvTestHooks(): void {
  beforeEach(() => {
    stubAllBlobEnvEmpty();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });
}

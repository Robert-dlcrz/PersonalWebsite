import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LumaApiError } from '@/persistence/lumaClient';
import { LumaServiceGenerationError } from '@/service/luma/lumaServiceGenerationError';

const { mockGenerate, mockDownload, mockPut, mockExists } = vi.hoisted(() => ({
  mockGenerate: vi.fn(),
  mockDownload: vi.fn(),
  mockPut: vi.fn(),
  mockExists: vi.fn(),
}));

// The route holds module-level service singletons; swap the classes for stubs
// that share the hoisted mocks, keeping every error class from the real module
// so the route's instanceof mapping stays under test.
vi.mock('@/service/luma/lumaGenerationService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/service/luma/lumaGenerationService')>();
  return {
    ...actual,
    LumaGenerationService: class {
      generateComposite = mockGenerate;
    },
  };
});

vi.mock('@/service/httpService', () => ({
  HttpService: class {
    download = mockDownload;
    exists = mockExists;
  },
}));

vi.mock('@/persistence/blobClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/persistence/blobClient')>();
  return {
    ...actual,
    BlobClient: class {
      putBlob = mockPut;
    },
  };
});

// The Zod schema parse stays real (pure, fast); the network preflight is
// covered by stubbing HttpService.exists above.
import { POST } from '@/app/api/trips/composite/route';

const SECRET = 'test-pipeline-secret-0123456789abcdef';
const LUMA_ID = 'd290f1ee-6c54-4b01-90e6-d701748f0851';
const VALID_URL = 'https://avswwi5vtnxsddjy.public.blob.vercel-storage.com/trips/2026/coachella/photos/IMG_3406.jpg';

const OUTPUT_URL = 'https://storage.example.com/output.png';
const completedGeneration = { id: LUMA_ID, outputUrl: OUTPUT_URL };
const downloaded = { bytes: Buffer.from([1, 2, 3]), contentType: 'image/png' };
const BLOB_URL = `https://blob.example.com/trips/composites/${LUMA_ID}.png`;

function makeRequest({
  body = { prompt: 'A composite of the trip', refs: [{ url: VALID_URL }] },
  secret = SECRET,
  rawBody,
}: {
  body?: unknown;
  secret?: string | null;
  rawBody?: string;
} = {}): Request {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (secret !== null) headers['x-pipeline-secret'] = secret;
  return new Request('http://localhost/api/trips/composite', {
    method: 'POST',
    headers,
    body: rawBody ?? JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.stubEnv('PIPELINE_SECRET', SECRET);
  // exists() contract: one result per input URL, input order.
  mockExists.mockImplementation(async (urls: string[]) => urls.map((url) => ({ url, ok: true })));
  mockGenerate.mockResolvedValue(completedGeneration);
  mockDownload.mockResolvedValue(downloaded);
  mockPut.mockResolvedValue({ url: BLOB_URL });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe('POST /api/trips/composite — auth gate', () => {
  it.each([
    ['missing header', null],
    ['wrong secret', 'wrong-secret'],
    ['prefix of the real secret (length mismatch)', SECRET.slice(0, -1)],
  ])('returns 401 and never spends when the secret is %s', async (_label, secret) => {
    const response = await POST(makeRequest({ secret }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'unauthorized' });
    expect(mockExists).not.toHaveBeenCalled();
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it('returns 401 when PIPELINE_SECRET is not configured server-side', async () => {
    vi.stubEnv('PIPELINE_SECRET', '');

    const response = await POST(makeRequest());

    expect(response.status).toBe(401);
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it('never echoes the secret in any response body', async () => {
    const response = await POST(makeRequest({ secret: 'wrong-secret' }));

    expect(await response.text()).not.toContain(SECRET);
  });
});

describe('POST /api/trips/composite — validation (no Luma spend on rejected input)', () => {
  it('returns 400 for a non-JSON body', async () => {
    const response = await POST(makeRequest({ rawBody: 'not json{' }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'invalid_request',
      details: ['body must be valid JSON'],
    });
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it('returns 400 with field-level details on structural failure', async () => {
    const response = await POST(makeRequest({ body: { prompt: '', refs: [] } }));

    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toBe('invalid_request');
    expect(payload.details.length).toBeGreaterThan(0);
    expect(mockExists).not.toHaveBeenCalled();
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it('returns 400 with the per-ref breakdown when a url ref does not exist, without calling Luma', async () => {
    mockExists.mockResolvedValue([{ url: VALID_URL, ok: false, reason: 'status_404' }]);

    const response = await POST(makeRequest());

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'ref_preflight_failed',
      refs: [{ index: 0, ok: false, reason: 'status_404' }],
    });
    expect(mockExists).toHaveBeenCalledWith([VALID_URL]);
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it('skips file_id refs but still reports them in a failed preflight breakdown', async () => {
    const fileId = 'f1e2d3c4-b5a6-7890-abcd-ef0123456789';
    mockExists.mockResolvedValue([{ url: VALID_URL, ok: false, reason: 'unreachable_or_timeout' }]);

    const response = await POST(
      makeRequest({
        body: {
          prompt: 'A composite of the trip',
          refs: [{ file_id: fileId }, { url: VALID_URL }],
        },
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'ref_preflight_failed',
      refs: [
        { index: 0, ok: true, skipped: 'file_id' },
        { index: 1, ok: false, reason: 'unreachable_or_timeout' },
      ],
    });
    // Only the url ref hits the network; there is no endpoint to verify file_id.
    expect(mockExists).toHaveBeenCalledWith([VALID_URL]);
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it('proceeds to Luma when every url ref exists and file_id refs are skipped', async () => {
    const fileId = 'f1e2d3c4-b5a6-7890-abcd-ef0123456789';

    const response = await POST(
      makeRequest({
        body: {
          prompt: 'A composite of the trip',
          refs: [{ url: VALID_URL }, { file_id: fileId }],
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(mockExists).toHaveBeenCalledWith([VALID_URL]);
    expect(mockGenerate).toHaveBeenCalledWith({
      prompt: 'A composite of the trip',
      refs: [{ url: VALID_URL }, { file_id: fileId }],
    });
  });
});

describe('POST /api/trips/composite — orchestration', () => {
  it('returns { id, url } after generate -> download -> put', async () => {
    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ id: LUMA_ID, url: BLOB_URL });
    expect(mockGenerate).toHaveBeenCalledWith({
      prompt: 'A composite of the trip',
      refs: [{ url: VALID_URL }],
    });
    expect(mockDownload).toHaveBeenCalledWith(OUTPUT_URL);
    expect(mockPut).toHaveBeenCalledWith(
      `trips/composites/${LUMA_ID}.png`,
      downloaded.bytes,
      { contentType: 'image/png' },
    );
  });

  it('derives a .jpg pathname from a jpeg content-type', async () => {
    mockDownload.mockResolvedValue({ bytes: downloaded.bytes, contentType: 'image/jpeg' });

    await POST(makeRequest());

    expect(mockPut).toHaveBeenCalledWith(
      `trips/composites/${LUMA_ID}.jpg`,
      downloaded.bytes,
      { contentType: 'image/jpeg' },
    );
  });
});

describe('POST /api/trips/composite — error mapping', () => {
  it.each([
    ['Luma 402 (empty balance)', new LumaApiError(402, null), 402, 'luma_insufficient_balance'],
    ['Luma 429 (rate limited)', new LumaApiError(429, null), 429, 'luma_rate_limited'],
    ['Luma 401 (bad key, hidden as upstream failure)', new LumaApiError(401, null), 502, 'luma_auth_failed'],
    ['Luma 422 (rejected request)', new LumaApiError(422, null), 422, 'luma_rejected_request'],
    ['Luma 500 (upstream down)', new LumaApiError(500, null), 502, 'luma_unavailable'],
    ['connection failure (no status)', new LumaApiError(undefined, null), 502, 'luma_unavailable'],
  ])('maps %s', async (_label, error, expectedStatus, expectedCode) => {
    mockGenerate.mockRejectedValue(error);

    const response = await POST(makeRequest());

    expect(response.status).toBe(expectedStatus);
    const payload = await response.json();
    expect(payload.error).toBe(expectedCode);
  });

  it('maps a failed generation to 422 with the Luma id and failure code', async () => {
    mockGenerate.mockRejectedValue(new LumaServiceGenerationError('generation_failed', LUMA_ID, 'content_moderated'));

    const response = await POST(makeRequest());

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      error: 'generation_failed',
      lumaId: LUMA_ID,
      failureCode: 'content_moderated',
    });
  });

  it('maps a poll timeout to 504 with the Luma id for manual re-polling', async () => {
    mockGenerate.mockRejectedValue(new LumaServiceGenerationError('poll_timeout', LUMA_ID));

    const response = await POST(makeRequest());

    expect(response.status).toBe(504);
    await expect(response.json()).resolves.toEqual({ error: 'poll_timeout', lumaId: LUMA_ID });
  });

  it.each([
    ['download failure', () => mockDownload.mockRejectedValue(new Error('download_status_403'))],
    ['Blob put failure', () => mockPut.mockRejectedValue(new Error('token missing'))],
    ['completed generation with no output', () => mockGenerate.mockRejectedValue(new LumaServiceGenerationError('missing_output', LUMA_ID))],
  ])('maps %s to 500 with the Luma id (paid output is recoverable)', async (_label, arrange) => {
    arrange();

    const response = await POST(makeRequest());

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'persist_failed', lumaId: LUMA_ID });
  });

  it('maps an unexpected error to a generic 500 without leaking details', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGenerate.mockRejectedValue(new Error('something with a secret in it'));

    const response = await POST(makeRequest());

    expect(response.status).toBe(500);
    const text = await response.text();
    expect(JSON.parse(text)).toEqual({ error: 'internal_error' });
    expect(text).not.toContain('secret');
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

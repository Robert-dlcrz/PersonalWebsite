import { describe, expect, it, vi } from 'vitest';

import {
  buildCompositeRequestBody,
  COMPOSITE_ASPECT_RATIO,
  costHint,
  generateTripCover,
  installTripCover,
  MAX_REFS,
  selectCompositeRefs,
  shouldGenerateCover,
  TRIP_COVER_PROMPT,
  validateCoverEnv,
} from '../trip-cover-pipeline.mjs';

const BLOB_BASE = 'https://avswwi5vtnxsddjy.public.blob.vercel-storage.com'; // pragma: allowlist secret

describe('TRIP_COVER_PROMPT', () => {
  const expectedPrompt =
    'A vibrant photo composite for a travel website trip cover, with no people anywhere in the frame. ' +
    'Do not require an element from every photo. ' +
    'Select the most standout feature or features from these photos and use that as the main focus, ' +
    'then blend supporting scenery into one cohesive scene. ' +
    'Rich saturated colors and luminous light, matching the bold, punchy feel of an editorial travel photo grid, ' +
    'while keeping the composition clean and balanced with a clear focal point so it reads easily as a single cover image at small sizes.';

  it('matches the locked prompt string exactly', () => {
    expect(TRIP_COVER_PROMPT).toBe(expectedPrompt);
  });
});

describe('selectCompositeRefs', () => {
  it('excludes cover.jpg (case-insensitive)', () => {
    const files = ['/photos/IMG_001.jpg', '/photos/cover.jpg', '/photos/IMG_002.jpg'];
    expect(selectCompositeRefs(files)).toEqual(['/photos/IMG_001.jpg', '/photos/IMG_002.jpg']);
  });

  it('excludes Cover.JPG (mixed case)', () => {
    const files = ['/photos/Cover.JPG', '/photos/IMG_001.jpg'];
    expect(selectCompositeRefs(files)).toEqual(['/photos/IMG_001.jpg']);
  });

  it('caps at MAX_REFS (9)', () => {
    const files = Array.from({ length: 15 }, (_, i) => `/photos/IMG_${String(i).padStart(3, '0')}.jpg`);
    const result = selectCompositeRefs(files);
    expect(result).toHaveLength(MAX_REFS);
    expect(result).toEqual(files.slice(0, 9));
  });

  it('returns all files when fewer than 9 and no cover.jpg', () => {
    const files = ['/a.jpg', '/b.jpg', '/c.jpg'];
    expect(selectCompositeRefs(files)).toEqual(files);
  });

  it('returns empty array when input is empty', () => {
    expect(selectCompositeRefs([])).toEqual([]);
  });

  it('returns empty array when only cover.jpg exists', () => {
    expect(selectCompositeRefs(['/photos/cover.jpg'])).toEqual([]);
  });

  it('handles blob pathnames correctly', () => {
    const paths = [
      'trips/2026/boston/photos/cover.jpg',
      'trips/2026/boston/photos/IMG_001.jpg',
      'trips/2026/boston/photos/IMG_002.jpg',
    ];
    expect(selectCompositeRefs(paths)).toEqual([
      'trips/2026/boston/photos/IMG_001.jpg',
      'trips/2026/boston/photos/IMG_002.jpg',
    ]);
  });
});

describe('costHint', () => {
  it('returns ~$0.0700 for 9 refs (~7¢)', () => {
    const hint = costHint(9);
    expect(hint).toBe('~$0.0700');
  });

  it('returns a proportional hint for fewer refs', () => {
    const hint = costHint(3);
    expect(hint).toBe('~$0.0233');
  });

  it('returns ~$0.00 for zero refs', () => {
    expect(costHint(0)).toBe('~$0.00');
  });

  it('returns ~$0.00 for negative refs', () => {
    expect(costHint(-1)).toBe('~$0.00');
  });
});

describe('shouldGenerateCover', () => {
  it('returns true for a normal onboard (no flags)', () => {
    expect(shouldGenerateCover({ dryRun: false, skipCover: false })).toBe(true);
  });

  it('returns false when --dry-run is set', () => {
    expect(shouldGenerateCover({ dryRun: true, skipCover: false })).toBe(false);
  });

  it('returns false when --skip-cover is set', () => {
    expect(shouldGenerateCover({ dryRun: false, skipCover: true })).toBe(false);
  });

  it('returns false when both --dry-run and --skip-cover are set', () => {
    expect(shouldGenerateCover({ dryRun: true, skipCover: true })).toBe(false);
  });
});

describe('validateCoverEnv', () => {
  it('returns empty array when all required vars are present', () => {
    const env = {
      PIPELINE_SECRET: 'secret',
      COMPOSITE_API_URL: 'https://example.com/api/trips/composite',
      ROBDLC_PERSONAL_WEBSITE_READ_WRITE_TOKEN: 'token',
    };
    expect(validateCoverEnv(env)).toEqual([]);
  });

  it('returns missing var names when none are set', () => {
    expect(validateCoverEnv({})).toEqual([
      'PIPELINE_SECRET',
      'COMPOSITE_API_URL',
      'ROBDLC_PERSONAL_WEBSITE_READ_WRITE_TOKEN',
    ]);
  });

  it('returns only the missing vars', () => {
    const env = { PIPELINE_SECRET: 'secret' };
    expect(validateCoverEnv(env)).toEqual(['COMPOSITE_API_URL', 'ROBDLC_PERSONAL_WEBSITE_READ_WRITE_TOKEN']);
  });

  it('treats empty string as missing', () => {
    const env = {
      PIPELINE_SECRET: '',
      COMPOSITE_API_URL: 'https://example.com/api/trips/composite',
      ROBDLC_PERSONAL_WEBSITE_READ_WRITE_TOKEN: 'token',
    };
    expect(validateCoverEnv(env)).toEqual(['PIPELINE_SECRET']);
  });
});

describe('buildCompositeRequestBody', () => {
  it('builds a request with correct prompt, aspectRatio, and blob-prefixed refs', () => {
    const paths = ['trips/2026/boston/photos/IMG_001.jpg', 'trips/2026/boston/photos/IMG_002.jpg'];
    const body = buildCompositeRequestBody(paths, BLOB_BASE);

    expect(body.prompt).toBe(TRIP_COVER_PROMPT);
    expect(body.aspectRatio).toBe('2:3');
    expect(body.refs).toEqual([
      { url: `${BLOB_BASE}/trips/2026/boston/photos/IMG_001.jpg` },
      { url: `${BLOB_BASE}/trips/2026/boston/photos/IMG_002.jpg` },
    ]);
  });

  it('strips leading slashes from pathnames', () => {
    const body = buildCompositeRequestBody(['/trips/photo.jpg'], BLOB_BASE);
    expect(body.refs[0].url).toBe(`${BLOB_BASE}/trips/photo.jpg`);
  });
});

describe('generateTripCover', () => {
  const defaultOpts = {
    compositeApiUrl: 'https://example.com/api/trips/composite',
    pipelineSecret: 'test-secret',
    body: { prompt: 'test', refs: [{ url: `${BLOB_BASE}/photo.jpg` }], aspectRatio: '2:3' as const },
  };

  it('returns { id, url } on a successful response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'luma-123', url: `${BLOB_BASE}/trips/composites/luma-123.jpg` }),
    });

    const result = await generateTripCover({ ...defaultOpts, fetchFn: mockFetch });

    expect(result).toEqual({ id: 'luma-123', url: `${BLOB_BASE}/trips/composites/luma-123.jpg` });
    expect(mockFetch).toHaveBeenCalledWith(defaultOpts.compositeApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pipeline-secret': 'test-secret',
      },
      body: JSON.stringify(defaultOpts.body),
    });
  });

  it('throws on non-ok response with error detail', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'unauthorized' }),
    });

    await expect(generateTripCover({ ...defaultOpts, fetchFn: mockFetch })).rejects.toThrow(
      'Composite API returned HTTP 401: unauthorized',
    );
  });

  it('throws on non-ok response when body is not JSON', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('not json')),
    });

    await expect(generateTripCover({ ...defaultOpts, fetchFn: mockFetch })).rejects.toThrow(
      'Composite API returned HTTP 500',
    );
  });

  it('throws when response is missing id or url', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'luma-123' }),
    });

    await expect(generateTripCover({ ...defaultOpts, fetchFn: mockFetch })).rejects.toThrow(
      'Composite API response missing id or url',
    );
  });
});

describe('installTripCover', () => {
  it('spawns set-trip-cover.mjs with correct arguments', async () => {
    const mockExecFile = vi.fn().mockResolvedValue({ stdout: 'cover updated\n', stderr: '' });

    const stdout = await installTripCover({
      imageUrl: `${BLOB_BASE}/trips/composites/luma-123.jpg`,
      trip: '2026/boston',
      scriptPath: '/workspace/scripts/set-trip-cover.mjs',
      execFileFn: mockExecFile,
    });

    expect(stdout).toBe('cover updated\n');
    expect(mockExecFile).toHaveBeenCalledWith('node', [
      '/workspace/scripts/set-trip-cover.mjs',
      '--image',
      `${BLOB_BASE}/trips/composites/luma-123.jpg`,
      '--trip',
      '2026/boston',
    ]);
  });

  it('propagates errors from the child process', async () => {
    const mockExecFile = vi.fn().mockRejectedValue(new Error('sips not found'));

    await expect(
      installTripCover({
        imageUrl: `${BLOB_BASE}/trips/composites/luma-123.jpg`,
        trip: '2026/boston',
        scriptPath: '/workspace/scripts/set-trip-cover.mjs',
        execFileFn: mockExecFile,
      }),
    ).rejects.toThrow('sips not found');
  });
});

describe('COMPOSITE_ASPECT_RATIO', () => {
  it('is 2:3', () => {
    expect(COMPOSITE_ASPECT_RATIO).toBe('2:3');
  });
});

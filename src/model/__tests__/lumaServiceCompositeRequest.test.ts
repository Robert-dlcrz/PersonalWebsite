import { describe, expect, it } from 'vitest';

import { LumaServiceCompositeRequestSchema } from '@/model/lumaServiceCompositeRequest';

const VALID_URL = 'https://avswwi5vtnxsddjy.public.blob.vercel-storage.com/trips/2026/coachella/photos/IMG_3406.jpg';
const VALID_FILE_ID = 'f1e2d3c4-b5a6-7890-abcd-ef0123456789';

function validBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    prompt: 'A composite of the trip',
    refs: [{ url: VALID_URL }],
    ...overrides,
  };
}

function issueLines(raw: unknown): string {
  const result = LumaServiceCompositeRequestSchema.safeParse(raw);
  if (result.success) {
    return '';
  }
  return result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
}

describe('LumaServiceCompositeRequestSchema — structural validation', () => {
  it('accepts a minimal valid body and returns a typed LumaServiceCompositeRequest', () => {
    const result = LumaServiceCompositeRequestSchema.safeParse(validBody());

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ prompt: 'A composite of the trip', refs: [{ url: VALID_URL }] });
  });

  it('accepts a valid aspectRatio and trims the prompt', () => {
    const result = LumaServiceCompositeRequestSchema.safeParse(
      validBody({ prompt: '  hello  ', aspectRatio: '16:9' }),
    );

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ prompt: 'hello', refs: [{ url: VALID_URL }], aspectRatio: '16:9' });
  });

  it('accepts a file_id ref', () => {
    const result = LumaServiceCompositeRequestSchema.safeParse(
      validBody({ refs: [{ file_id: VALID_FILE_ID }] }),
    );

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ prompt: 'A composite of the trip', refs: [{ file_id: VALID_FILE_ID }] });
  });

  it('accepts the maximum of 9 refs', () => {
    const refs = Array.from({ length: 9 }, (_, i) => ({ url: `${VALID_URL}?photo=${i}` }));

    expect(LumaServiceCompositeRequestSchema.safeParse(validBody({ refs })).success).toBe(true);
  });

  it.each([
    ['null body', null],
    ['array body', []],
    ['string body', 'nope'],
  ])('rejects a non-object body (%s)', (_label, body) => {
    expect(LumaServiceCompositeRequestSchema.safeParse(body).success).toBe(false);
  });

  it.each([
    ['missing prompt', { prompt: undefined }, /prompt: required string/],
    ['empty prompt', { prompt: '   ' }, /prompt: must be 1-6000/],
    ['over-long prompt', { prompt: 'x'.repeat(6001) }, /prompt: must be 1-6000/],
    ['missing refs', { refs: undefined }, /refs: required array/],
    ['empty refs', { refs: [] }, /refs: must contain 1-9 entries/],
    ['ten refs (Luma caps reference images at 9)', { refs: Array.from({ length: 10 }, (_, i) => ({ url: `${VALID_URL}?p=${i}` })) }, /refs: must contain 1-9 entries/],
    ['ref with both url and file_id', { refs: [{ url: VALID_URL, file_id: VALID_FILE_ID }] }, /exactly one of "url" or "file_id"/],
    ['ref with neither', { refs: [{}] }, /exactly one of "url" or "file_id"/],
    ['base64 data ref', { refs: [{ data: 'aGk=', media_type: 'image/png' }] }, /exactly one of "url" or "file_id"/],
    ['malformed url', { refs: [{ url: 'not a url' }] }, /not a valid URL/],
    ['non-blob url', { refs: [{ url: 'https://example.com/a.jpg' }] }, /must be a Vercel Blob URL/],
    ['http blob url', { refs: [{ url: 'http://avswwi5vtnxsddjy.public.blob.vercel-storage.com/trips/2026/coachella/photos/IMG_3406.jpg' }] }, /must be a Vercel Blob URL/],
    ['malformed file_id', { refs: [{ file_id: 'not-a-uuid' }] }, /must be a UUID/],
    ['duplicate refs', { refs: [{ url: VALID_URL }, { url: VALID_URL }] }, /duplicate of an earlier ref/],
    ['bad aspectRatio', { aspectRatio: '4:3' }, /aspectRatio: must be one of/],
    ['unknown top-level field', { ref: [{ url: VALID_URL }] }, /Unrecognized key.*"ref"/],
  ])('rejects %s', (_label, overrides, expectedError) => {
    expect(issueLines(validBody(overrides))).toMatch(expectedError);
  });

  it('collects every field error in one pass', () => {
    const result = LumaServiceCompositeRequestSchema.safeParse({ prompt: '', refs: [], extra: true });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toHaveLength(3);
    }
  });
});

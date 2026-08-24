import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LumaApiError, type Generation, type LumaClient } from '@/persistence/lumaClient';
import { LumaServiceGenerationError } from '@/service/luma/lumaServiceGenerationError';
import { LumaGenerationService } from '@/service/luma/lumaGenerationService';
import type { LumaServiceCompositeRequest } from '@/model/lumaServiceCompositeRequest';

const LUMA_ID = 'luma-generation-id-TEST-ONLY';
const OUTPUT_URL = 'https://luma-output.example.test/generations/TEST-ONLY/output.png';

const request: LumaServiceCompositeRequest = {
  prompt: 'A composite of the trip',
  refs: [{ url: 'https://blob.example.test/fake-trip-photo.jpg' }],
  aspectRatio: '16:9',
};

function makeGeneration(overrides: Partial<Generation>): Generation {
  return {
    id: LUMA_ID,
    created_at: '2026-08-23T00:00:00Z',
    model: 'uni-1',
    state: 'queued',
    type: 'image',
    output: [],
    ...overrides,
  };
}

type FakeLumaClient = {
  createGeneration: ReturnType<typeof vi.fn>;
  getGeneration: ReturnType<typeof vi.fn>;
};

function makeService(fake: FakeLumaClient): LumaGenerationService {
  return new LumaGenerationService(fake as unknown as LumaClient);
}

describe('LumaGenerationService.toCreateParams', () => {
  it('maps LumaServiceCompositeRequest onto the official Luma create body', () => {
    const fileId = 'luma-file-id-TEST-ONLY';

    expect(
      LumaGenerationService.toCreateParams({
        prompt: request.prompt,
        refs: [request.refs[0], { file_id: fileId }],
        aspectRatio: '16:9',
      }),
    ).toEqual({
      prompt: request.prompt,
      model: 'uni-1',
      type: 'image',
      image_ref: [request.refs[0], { file_id: fileId }],
      aspect_ratio: '16:9',
    });

    expect(LumaGenerationService.toCreateParams({ prompt: 'no ratio', refs: request.refs })).toEqual({
      prompt: 'no ratio',
      model: 'uni-1',
      type: 'image',
      image_ref: request.refs,
    });
  });
});

describe('LumaGenerationService.generateComposite', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('submits, polls every 2s, and returns the completed generation', async () => {
    const fake: FakeLumaClient = {
      createGeneration: vi.fn().mockResolvedValue(makeGeneration({ state: 'queued' })),
      getGeneration: vi
        .fn()
        .mockResolvedValueOnce(makeGeneration({ state: 'processing' }))
        .mockResolvedValueOnce(
          makeGeneration({ state: 'completed', output: [{ type: 'image', url: OUTPUT_URL }] }),
        ),
    };

    const pending = makeService(fake).generateComposite(request);
    await vi.advanceTimersByTimeAsync(4_000); // two 2s poll intervals
    const generation = await pending;

    expect(generation).toEqual({ id: LUMA_ID, outputUrl: OUTPUT_URL });
    expect(fake.createGeneration).toHaveBeenCalledWith({
      prompt: request.prompt,
      model: 'uni-1',
      type: 'image',
      image_ref: request.refs,
      aspect_ratio: '16:9',
    });
    expect(fake.getGeneration).toHaveBeenCalledTimes(2);
    expect(fake.getGeneration).toHaveBeenCalledWith(LUMA_ID);
  });

  it('omits aspect_ratio when the request does not set one', async () => {
    const fake: FakeLumaClient = {
      createGeneration: vi
        .fn()
        .mockResolvedValue(
          makeGeneration({ state: 'completed', output: [{ type: 'image', url: OUTPUT_URL }] }),
        ),
      getGeneration: vi.fn(),
    };

    await makeService(fake).generateComposite({ prompt: 'p', refs: request.refs });

    expect(fake.createGeneration).toHaveBeenCalledWith(
      expect.not.objectContaining({ aspect_ratio: expect.anything() }),
    );
    expect(fake.getGeneration).not.toHaveBeenCalled();
  });

  it('throws LumaServiceGenerationError generation_failed with the failure code', async () => {
    const fake: FakeLumaClient = {
      createGeneration: vi.fn().mockResolvedValue(makeGeneration({ state: 'queued' })),
      getGeneration: vi.fn().mockResolvedValue(
        makeGeneration({
          state: 'failed',
          failure_code: 'content_moderated',
          failure_reason: 'Flagged by moderation',
        }),
      ),
    };

    const pending = makeService(fake).generateComposite(request);
    const assertion = expect(pending).rejects.toMatchObject({
      name: 'LumaServiceGenerationError',
      code: 'generation_failed',
      lumaId: LUMA_ID,
      failureCode: 'content_moderated',
    });
    await vi.advanceTimersByTimeAsync(2_000);
    await assertion;

    const rejection = await pending.catch((error) => error);
    expect(rejection).toBeInstanceOf(LumaServiceGenerationError);
  });

  it('throws LumaServiceGenerationError poll_timeout when the poll AbortSignal times out', async () => {
    // Node's AbortSignal.timeout is not driven by Vitest fake timers.
    vi.spyOn(AbortSignal, 'timeout').mockReturnValue(AbortSignal.abort());

    const fake: FakeLumaClient = {
      createGeneration: vi.fn().mockResolvedValue(makeGeneration({ state: 'queued' })),
      getGeneration: vi.fn().mockResolvedValue(makeGeneration({ state: 'processing' })),
    };

    await expect(makeService(fake).generateComposite(request)).rejects.toMatchObject({
      name: 'LumaServiceGenerationError',
      code: 'poll_timeout',
      lumaId: LUMA_ID,
    });
    expect(AbortSignal.timeout).toHaveBeenCalledWith(270_000);
    expect(fake.getGeneration).not.toHaveBeenCalled();
    vi.mocked(AbortSignal.timeout).mockRestore();
  });

  it('throws LumaServiceGenerationError missing_output when Luma completes with no output', async () => {
    const fake: FakeLumaClient = {
      createGeneration: vi
        .fn()
        .mockResolvedValue(makeGeneration({ state: 'completed', output: [] })),
      getGeneration: vi.fn(),
    };

    await expect(makeService(fake).generateComposite(request)).rejects.toMatchObject({
      name: 'LumaServiceGenerationError',
      code: 'missing_output',
      lumaId: LUMA_ID,
    });
  });

  it('propagates LumaApiError from the client untouched', async () => {
    const apiError = new LumaApiError(402, 'req-123');
    const fake: FakeLumaClient = {
      createGeneration: vi.fn().mockRejectedValue(apiError),
      getGeneration: vi.fn(),
    };

    await expect(makeService(fake).generateComposite(request)).rejects.toBe(apiError);
  });
});

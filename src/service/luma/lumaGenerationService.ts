import { setTimeout as sleep } from 'node:timers/promises';

import { LumaClient, type Generation, type GenerationCreateParams } from '@/persistence/lumaClient';
import type { LumaServiceCompositeRequest } from '@/model/lumaServiceCompositeRequest';
import { LumaServiceGenerationError } from '@/service/luma/lumaServiceGenerationError';

const POLL_INTERVAL_MS = 2_000;

/**
 * 270s, not the route's 300s `maxDuration`: the function itself is killed at
 * 300s, so the deadline leaves headroom to return a 504 carrying the Luma id
 * (the job keeps running at Luma and is re-pollable), and on success to
 * download and persist the output.
 */
const POLL_DEADLINE_MS = 270_000;

/**
 * Domain logic for the Luma side of the pipeline: submit a uni-1 generation,
 * poll every 2s to a hard deadline, and translate terminal states into typed
 * errors. Knows nothing about Blob storage; returns the Luma id and the
 * 1-hour presigned output URL for the storage service to persist.
 */
export class LumaGenerationService {
  private static readonly MODEL = 'uni-1' satisfies NonNullable<GenerationCreateParams['model']>;
  private static readonly TYPE = 'image' satisfies NonNullable<GenerationCreateParams['type']>;

  private readonly luma: LumaClient;

  constructor(luma = new LumaClient()) {
    this.luma = luma;
  }

  /**
   * Maps our wire model onto the official SDK create body. The v0.1.2 `ImageRef`
   * type only declares `url` / `data`; REST also accepts `file_id`, so that
   * branch is cast at this boundary (the client stays on SDK types).
   */
  static toCreateParams(input: LumaServiceCompositeRequest): GenerationCreateParams {
    return {
      prompt: input.prompt,
      model: LumaGenerationService.MODEL,
      type: LumaGenerationService.TYPE,
      image_ref: input.refs.map((ref) =>
        'url' in ref ? { url: ref.url } : { file_id: ref.file_id },
      ) as GenerationCreateParams['image_ref'],
      ...(input.aspectRatio ? { aspect_ratio: input.aspectRatio } : {}),
    };
  }

  async generateComposite(input: LumaServiceCompositeRequest): Promise<{ id: string; outputUrl: string }> {
    let generation = await this.luma.createGeneration(LumaGenerationService.toCreateParams(input));

    const signal = AbortSignal.timeout(POLL_DEADLINE_MS);
    while (generation.state !== 'completed' && generation.state !== 'failed') {
      if (signal.aborted) {
        throw new LumaServiceGenerationError('poll_timeout', generation.id);
      }
      await sleep(POLL_INTERVAL_MS);
      generation = await this.luma.getGeneration(generation.id);
    }

    if (generation.state === 'failed') {
      throw new LumaServiceGenerationError('generation_failed', generation.id, generation.failure_code ?? null);
    }

    if (!generation.output || generation.output.length === 0) {
      throw new LumaServiceGenerationError('missing_output', generation.id);
    }

    return { id: generation.id, outputUrl: generation.output[0].url };
  }
}

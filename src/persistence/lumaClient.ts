import Luma, { APIError } from 'luma-agents';
import type { Generation, GenerationCreateParams } from 'luma-agents/resources/generations';

export type { Generation, GenerationCreateParams };

/**
 * Raised for any Luma API failure. Carries only the HTTP status and Luma's
 * request id — never the API key and never the raw SDK error body — so upper
 * layers can map statuses to responses without risk of leaking credentials.
 */
export class LumaApiError extends Error {
  constructor(
    public readonly status: number | undefined,
    public readonly requestId: string | null,
  ) {
    super(`LumaClient: Luma API request failed (status ${status ?? 'unknown'})`);
    this.name = 'LumaApiError';
  }
}

function toLumaApiError(error: unknown): LumaApiError {
  if (error instanceof APIError) {
    const requestId = error.headers?.get('x-request-id') ?? null;
    console.error(`LumaClient: API error status=${error.status ?? 'unknown'} requestId=${requestId ?? 'n/a'}`);
    return new LumaApiError(error.status, requestId);
  }
  console.error('LumaClient: non-API error talking to Luma', error);
  return new LumaApiError(undefined, null);
}

/**
 * Raw connection to the Luma Agents API. Logs and rethrows as `LumaApiError`.
 * No polling, mapping, or domain decisions — those live in `LumaGenerationService`.
 *
 * Construction is lazy because the SDK throws when `LUMA_AGENTS_API_KEY` is
 * missing, and this module must be importable at build time.
 */
export class LumaClient {
  private sdk: Luma | null = null;

  private get client(): Luma {
    this.sdk ??= new Luma();
    return this.sdk;
  }

  async createGeneration(params: GenerationCreateParams): Promise<Generation> {
    try {
      const generation = await this.client.generations.create(params);
      console.log(`LumaClient: created generation id=${generation.id} state=${generation.state}`);
      return generation;
    } catch (error) {
      throw toLumaApiError(error);
    }
  }

  async getGeneration(id: string, signal?: AbortSignal): Promise<Generation> {
    try {
      return await this.client.generations.get(id, { signal });
    } catch (error) {
      throw toLumaApiError(error);
    }
  }
}

export type LumaServiceGenerationErrorCode = 'generation_failed' | 'poll_timeout' | 'missing_output';

/**
 * Typed failure from the Luma generation service. The route maps `code` to HTTP;
 * `lumaId` is always present so a paid job can be re-polled.
 */
export class LumaServiceGenerationError extends Error {
  constructor(
    public readonly code: LumaServiceGenerationErrorCode,
    public readonly lumaId: string,
    public readonly failureCode: string | null = null,
  ) {
    super(`Luma generation ${lumaId}: ${code}`);
    this.name = 'LumaServiceGenerationError';
  }
}

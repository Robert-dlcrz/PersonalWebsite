import { z } from 'zod';

import { blobHostname } from '../../next.config';

/**
 * The composite-generation request as it arrives on the wire at
 * `POST /api/trips/composite`:
 *
 *   {"prompt":"...","refs":[{"url":"https://.../cover.jpg"}],"aspectRatio":"16:9"}
 *
 * The Zod schema is the source of truth. Types below are inferred from it, so
 * holding a `LumaServiceCompositeRequest` means it already passed structural validation.
 */

/** Luma's documented cap on reference images per generation.
 * @see https://docs.agents.lumalabs.ai/guides/images/generation/#image_ref
 */
export const MAX_REFS = 9;

/** Luma's documented prompt length limit. */
export const MAX_PROMPT_LENGTH = 6000;

/** The 9 aspect ratios Luma's image generation documents as valid. */
export const LUMA_ASPECT_RATIOS = [
  '3:1',
  '2:1',
  '16:9',
  '3:2',
  '1:1',
  '2:3',
  '9:16',
  '1:2',
  '1:3',
] as const;

export type LumaAspectRatio = (typeof LUMA_ASPECT_RATIOS)[number];

/** Public origin of this site's Vercel Blob store — the only host URL refs may use. */
export const BLOB_URL_PREFIX = `https://${blobHostname}/`;

export const UrlRefSchema = z.strictObject({
  url: z
    .url({ error: 'not a valid URL' })
    .startsWith(BLOB_URL_PREFIX, `must be a Vercel Blob URL under ${BLOB_URL_PREFIX}`),
});

export const FileIdRefSchema = z.strictObject({
  file_id: z.uuid({ error: "must be a UUID from Luma's Files API" }),
});

/**
 * Exactly one of a public HTTPS URL or a Luma Files API `file_id`.
 * `.strict()` on each branch rejects extra keys (including base64 `data`).
 */
export const CompositeRefSchema = z.union([UrlRefSchema, FileIdRefSchema], {
  error: 'provide exactly one of "url" or "file_id"',
});

function refKey(ref: { url: string } | { file_id: string }): string {
  return 'url' in ref ? `url:${ref.url}` : `file_id:${ref.file_id.toLowerCase()}`;
}

export const LumaServiceCompositeRequestSchema = z
  .strictObject({
    prompt: z
      .string({ error: 'required string' })
      .trim()
      .min(1, `must be 1-${MAX_PROMPT_LENGTH} characters after trimming`)
      .max(MAX_PROMPT_LENGTH, `must be 1-${MAX_PROMPT_LENGTH} characters after trimming`),
    refs: z
      .array(CompositeRefSchema, { error: 'required array' })
      .min(1, `must contain 1-${MAX_REFS} entries`)
      .max(MAX_REFS, `must contain 1-${MAX_REFS} entries`)
      .superRefine((refs, ctx) => {
        const seen = new Set<string>();
        refs.forEach((ref, index) => {
          const key = refKey(ref);
          if (seen.has(key)) {
            ctx.addIssue({
              code: 'custom',
              path: [index],
              message: 'duplicate of an earlier ref (duplicates are wasted spend)',
            });
          }
          seen.add(key);
        });
      }),
    aspectRatio: z.enum(LUMA_ASPECT_RATIOS, {
      error: `must be one of ${LUMA_ASPECT_RATIOS.join(', ')}`,
    }).optional(),
  });

export type LumaServiceCompositeRequest = z.infer<typeof LumaServiceCompositeRequestSchema>;
export type CompositeRef = z.infer<typeof CompositeRefSchema>;
export type UrlRef = z.infer<typeof UrlRefSchema>;
export type FileIdRef = z.infer<typeof FileIdRefSchema>;

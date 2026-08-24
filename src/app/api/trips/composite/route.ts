import { timingSafeEqual } from 'node:crypto';

import { HttpService, type UrlExistenceFailureReason } from '@/service/httpService';
import { LumaServiceGenerationError } from '@/service/luma/lumaServiceGenerationError';
import { LumaGenerationService } from '@/service/luma/lumaGenerationService';
import { BlobClient } from '@/persistence/blobClient';
import { LumaApiError } from '@/persistence/lumaClient';
import {
  LumaServiceCompositeRequestSchema,
  type CompositeRef,
} from '@/model/lumaServiceCompositeRequest';

/**
 * POST /api/trips/composite — the pipeline's orchestrator (the `handler.py`
 * analog). Secret-gated, Rob-only; no CORS, no public surface. Sequences:
 * auth gate -> parse -> preflight -> generate (Luma, paid) -> download ->
 * put (Blob), and maps each layer's typed error to an HTTP status.
 */
export const runtime = 'nodejs';
export const maxDuration = 300;

const lumaGenerationService = new LumaGenerationService();
const httpService = new HttpService();
const blobClient = new BlobClient();

function isAuthorized(request: Request): boolean {
  const provided = request.headers.get('x-pipeline-secret');
  const expected = process.env.PIPELINE_SECRET;
  if (!provided || !expected) {
    return false;
  }
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  // Equal length first — timingSafeEqual throws on mismatched sizes; then constant-time so a wrong guess leaks no prefix.
  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
}

type RefPreflightEntry =
  | { index: number; ok: true; skipped?: 'file_id' }
  | { index: number; ok: false; reason: UrlExistenceFailureReason };

/**
 * Network preflight: prove every url ref exists right now (one bad ref fails
 * the whole batch — no partial submits). `file_id` refs are skipped: there is
 * no endpoint to verify them, so they surface as a Luma 422 at submit time,
 * which is still before any generation is billed.
 */
async function preflightRefs(refs: CompositeRef[]): Promise<RefPreflightEntry[]> {
  const urlRefs = refs.flatMap((ref, index) => ('url' in ref ? [{ index, url: ref.url }] : []));
  const existence = await httpService.exists(urlRefs.map((ref) => ref.url));
  // exists() returns one result per input URL in input order, so zip by position.
  const entryByIndex = new Map<number, RefPreflightEntry>(
    urlRefs.map(({ index }, position) => {
      const result = existence[position];
      return [index, result.ok ? { index, ok: true } : { index, ok: false, reason: result.reason }];
    }),
  );
  return refs.map(
    (ref, index): RefPreflightEntry =>
      entryByIndex.get(index) ?? { index, ok: true, skipped: 'file_id' },
  );
}

function extensionFromContentType(contentType: string | null): string {
  if (contentType?.includes('png')) return 'png';
  if (contentType?.includes('jpeg') || contentType?.includes('jpg')) return 'jpg';
  if (contentType?.includes('webp')) return 'webp';
  return 'png';
}

/** LumaClient layer: raw API refusals. Never surface Luma's own body or our key material. */
function mapLumaApiError(error: LumaApiError): Response {
  if (error.status === 402) {
    return Response.json({ error: 'luma_insufficient_balance' }, { status: 402 });
  }
  if (error.status === 429) {
    return Response.json({ error: 'luma_rate_limited' }, { status: 429 });
  }
  if (error.status === 401 || error.status === 403) {
    return Response.json({ error: 'luma_auth_failed' }, { status: 502 });
  }
  if (error.status === 400 || error.status === 413 || error.status === 422) {
    return Response.json({ error: 'luma_rejected_request', lumaStatus: error.status }, { status: 422 });
  }
  return Response.json({ error: 'luma_unavailable' }, { status: 502 });
}

/** LumaGenerationService layer: typed generation outcomes (exhaustive over the code union). */
function mapLumaServiceError(error: LumaServiceGenerationError): Response {
  switch (error.code) {
    case 'generation_failed':
      return Response.json(
        { error: 'generation_failed', lumaId: error.lumaId, failureCode: error.failureCode },
        { status: 422 },
      );
    case 'poll_timeout':
      return Response.json({ error: 'poll_timeout', lumaId: error.lumaId }, { status: 504 });
    case 'missing_output':
      return Response.json({ error: 'persist_failed', lumaId: error.lumaId }, { status: 500 });
  }
}

/** Anything thrown by the generate step; 500 fallback for the unexpected. */
function mapGenerateError(error: unknown): Response {
  if (error instanceof LumaApiError) {
    return mapLumaApiError(error);
  }
  if (error instanceof LumaServiceGenerationError) {
    return mapLumaServiceError(error);
  }
  console.error('composite route: unexpected generation error', error);
  return Response.json({ error: 'internal_error' }, { status: 500 });
}

/** Download / Blob put layers: always 500 — the paid output stays recoverable by re-polling the Luma id. */
function mapPersistError(lumaId: string, error: unknown): Response {
  console.error('composite route: persist failed', error);
  return Response.json({ error: 'persist_failed', lumaId }, { status: 500 });
}

export async function POST(request: Request): Promise<Response> {
  if (!isAuthorized(request)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return Response.json({ error: 'invalid_request', details: ['body must be valid JSON'] }, { status: 400 });
  }

  // Stage 1: structural validation (free, synchronous). Parse, don't validate:
  // raw JSON in, a typed request (or Zod's raw issues) out.
  const parsed = LumaServiceCompositeRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json({ error: 'invalid_request', details: parsed.error.issues }, { status: 400 });
  }

  // Stage 2: ref preflight (network, still free — no Luma spend until every ref passes).
  const preflight = await preflightRefs(parsed.data.refs);
  if (!preflight.every((entry) => entry.ok)) {
    return Response.json({ error: 'ref_preflight_failed', refs: preflight }, { status: 400 });
  }

  let generation: Awaited<ReturnType<LumaGenerationService['generateComposite']>>;
  try {
    generation = await lumaGenerationService.generateComposite(parsed.data);
  } catch (error) {
    return mapGenerateError(error);
  }

  let file: Awaited<ReturnType<HttpService['download']>>;
  try {
    file = await httpService.download(generation.outputUrl);
  } catch (error) {
    return mapPersistError(generation.id, error);
  }

  try {
    const pathname = `trips/composites/${generation.id}.${extensionFromContentType(file.contentType)}`;
    const blob = await blobClient.putBlob(pathname, file.bytes, {
      contentType: file.contentType ?? undefined,
    });
    return Response.json({ id: generation.id, url: blob.url });
  } catch (error) {
    return mapPersistError(generation.id, error);
  }
}

/**
 * Pure helpers for the Luma composite trip-cover pipeline.
 *
 * Extracted from onboard-trip.mjs so Vitest can exercise the logic
 * without running the full interactive ingest or hitting the network.
 */

import path from 'node:path'

export const TRIP_COVER_PROMPT =
  'A vibrant photo composite for a travel website trip cover, with no people anywhere in the frame. ' +
  'Do not require an element from every photo. ' +
  'Select the most standout feature or features from these photos and use that as the main focus, ' +
  'then blend supporting scenery into one cohesive scene. ' +
  'Rich saturated colors and luminous light, matching the bold, punchy feel of an editorial travel photo grid, ' +
  'while keeping the composition clean and balanced with a clear focal point so it reads easily as a single cover image at small sizes.'

export const COMPOSITE_ASPECT_RATIO = '2:3'

/** Approximate Luma cost per ref image (USD). */
const COST_PER_REF_CENTS = 7 / 9

/** Maximum reference images Luma accepts per generation. */
export const MAX_REFS = 9

/**
 * Pick up to {@link MAX_REFS} JPG paths for composite refs, excluding any
 * file named `cover.jpg` (case-insensitive).
 */
export function selectCompositeRefs(jpgFiles) {
  return jpgFiles
    .filter((f) => path.basename(f).toLowerCase() !== 'cover.jpg')
    .slice(0, MAX_REFS)
}

/**
 * Return a human-readable cost hint string for the given number of refs.
 * Uses the ~7¢-per-9-refs rate documented for Luma image generation.
 */
export function costHint(refCount) {
  if (refCount <= 0) {
    return '~$0.00'
  }

  const cents = refCount * COST_PER_REF_CENTS
  return `~$${(cents / 100).toFixed(4)}`
}

/**
 * Determine whether cover generation should run based on CLI flags.
 *
 * Rules:
 *   - `--dry-run`   → never generate
 *   - `--skip-cover` → never generate
 *   - otherwise      → generate (default ON for real onboard)
 */
export function shouldGenerateCover({ dryRun, skipCover }) {
  if (dryRun || skipCover) {
    return false
  }

  return true
}

/**
 * Fail-fast: require all env vars needed for a paid Luma generation before
 * doing any work that costs money. Returns an array of missing var names;
 * callers should throw when the array is non-empty.
 */
export function validateCoverEnv(env) {
  const required = ['PIPELINE_SECRET', 'COMPOSITE_API_URL', 'ROBDLC_PERSONAL_WEBSITE_READ_WRITE_TOKEN']
  return required.filter((key) => !env[key])
}

/**
 * Build the JSON body for `POST /api/trips/composite`.
 *
 * `blobBaseUrl` is the public blob origin (no trailing slash) prepended to
 * each photo pathname so refs satisfy the Zod `BLOB_URL_PREFIX` check.
 */
export function buildCompositeRequestBody(blobPhotoPaths, blobBaseUrl) {
  const refs = blobPhotoPaths.map((p) => ({
    url: `${blobBaseUrl}/${p.replace(/^\/+/, '')}`,
  }))

  return {
    prompt: TRIP_COVER_PROMPT,
    aspectRatio: COMPOSITE_ASPECT_RATIO,
    refs,
  }
}

/**
 * POST to the composite API endpoint. Returns `{ id, url }` on success.
 *
 * @param {object}   opts
 * @param {string}   opts.compositeApiUrl  Full URL to POST /api/trips/composite
 * @param {string}   opts.pipelineSecret   Value for x-pipeline-secret header
 * @param {object}   opts.body             JSON body ({@link buildCompositeRequestBody})
 * @param {typeof globalThis.fetch} [opts.fetchFn]  Injectable fetch (tests)
 */
export async function generateTripCover({ compositeApiUrl, pipelineSecret, body, fetchFn = fetch }) {
  const response = await fetchFn(compositeApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-pipeline-secret': pipelineSecret,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    let detail = ''

    try {
      const errorJson = await response.json()
      detail = errorJson.error ? `: ${errorJson.error}` : ''
    } catch {
      // response may not be JSON
    }

    throw new Error(`Composite API returned HTTP ${response.status}${detail}`)
  }

  const result = await response.json()

  if (!result.id || !result.url) {
    throw new Error('Composite API response missing id or url')
  }

  return { id: result.id, url: result.url }
}

/**
 * Install a generated composite as the trip's cover.jpg by spawning
 * `set-trip-cover.mjs`. Returns the child's stdout.
 *
 * @param {object}   opts
 * @param {string}   opts.imageUrl   Blob URL or pathname of the composite
 * @param {string}   opts.trip       year/slug (e.g. "2026/boston")
 * @param {string}   opts.scriptPath Absolute path to set-trip-cover.mjs
 * @param {Function} opts.execFileFn Promisified execFile (injectable for tests)
 */
export async function installTripCover({ imageUrl, trip, scriptPath, execFileFn }) {
  const { stdout } = await execFileFn('node', [scriptPath, '--image', imageUrl, '--trip', trip])
  return stdout
}

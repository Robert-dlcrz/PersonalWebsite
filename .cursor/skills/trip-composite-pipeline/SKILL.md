---
name: trip-composite-pipeline
description: Invoke the secret-gated Luma composite endpoint for trip photos. Use when generating a trip composite image, setting up LUMA_AGENTS_API_KEY or PIPELINE_SECRET, or troubleshooting a failed /api/trips/composite call.
disable-model-invocation: true
---

# Trip Composite Pipeline

Personal, secret-gated data pipeline: `POST /api/trips/composite` submits a Luma uni-1 generation from up to 9 reference photos, polls to completion, copies the output into Vercel Blob, and returns `{ id, url }`. No public surface — only Rob invokes it, via curl or a script, never from a browser page.

Behavior lives in the code; read it there rather than trusting a restatement here:

- Route (auth gate, Zod parse, ref preflight orchestration, error mapping): `src/app/api/trips/composite/route.ts`
- Request schema (source of truth for validation rules): `src/model/lumaServiceCompositeRequest.ts`
- URL existence checks: `HttpService.exists` in `src/service/httpService.ts` (the route skips `file_id` refs — no endpoint exists to verify them)
- Poll loop: `src/service/luma/lumaGenerationService.ts` · download: `src/service/httpService.ts` · put: `src/persistence/blobClient.ts`

## Steps

### Step 1: Pick refs

Choose up to 9 reference images. Trip photos already in Blob work directly — grab URLs like:

```
https://avswwi5vtnxsddjy.public.blob.vercel-storage.com/trips/{year}/{slug}/photos/cover.jpg
```

Luma `file_id`s (from a prior Files API upload) also work: `{"file_id":"<uuid>"}`.

**Done when:** every URL opens in a browser and renders an image.

### Step 2: Invoke

```bash
curl -X POST "$BASE_URL/api/trips/composite" \
  -H "content-type: application/json" \
  -H "x-pipeline-secret: $PIPELINE_SECRET" \
  -d '{"prompt":"...","refs":[{"url":"https://..."}],"aspectRatio":"16:9"}'
```

`BASE_URL` is `http://localhost:3000` under `pnpm dev` or the deployed site. `aspectRatio` is optional. Expect the call to hang up to ~4.5 minutes while the generation polls — that is normal.

**Done when:** the response is a 200 with `{ "id": "...", "url": "https://..." }`.

### Step 3: Verify

Open the returned Blob URL. Output lands at `trips/composites/{lumaId}.{ext}` in the store.

**Done when:** the composite renders in the browser.

### Step 4 (optional): Install as a trip cover

To make the composite a trip's cover photo, run `pnpm trip:cover -- --image <returned url> --trip <year>/<slug>`. It verifies the trip's photos path, converts PNG output to JPEG, and overwrites `trips/{year}/{slug}/photos/cover.jpg`.

## Environment

| Env var | Talks to | Where it's set |
|---|---|---|
| `LUMA_AGENTS_API_KEY` | Luma Agents API (funded key from platform.lumalabs.ai) | Vercel (Production + Preview) and local `.env.local` |
| `PIPELINE_SECRET` | Our route's auth gate (`openssl rand -hex 32`) | Vercel (Production + Preview) and local `.env.local` |
| `ROBDLC_PERSONAL_WEBSITE_READ_WRITE_TOKEN` | Vercel Blob writes | Already configured for the site |

Two secrets by design: the Luma key talks to Luma, the pipeline secret talks to our function. Neither ever appears in a response body or a browser.

## Failure table

| Status | Body `error` | Caller-side fix |
|---|---|---|
| 401 | `unauthorized` | Send the exact `x-pipeline-secret`; confirm `PIPELINE_SECRET` is set server-side |
| 400 | `invalid_request` + `details` | Fix the listed fields; the details name each one |
| 400 | `ref_preflight_failed` + `refs` | Per-ref breakdown: fix the URLs flagged not-ok (`status_404`, unreachable/timeout) |
| 402 | `luma_insufficient_balance` | Add funds at platform.lumalabs.ai |
| 422 | `generation_failed` + `failureCode` | Branch on the code (e.g. `content_moderated`); resubmit if transient |
| 422 | `luma_rejected_request` | Luma refused the parameters (e.g. image side >8,000 px, dead `file_id`) — nothing was billed |
| 429 | `luma_rate_limited` | Wait and retry |
| 502 | `luma_auth_failed` / `luma_unavailable` | Check the Luma key in Vercel env; otherwise retry later |
| 504 | `poll_timeout` + `lumaId` | Job may still finish at Luma; re-poll `GET /v1/generations/{lumaId}` with the Luma key |
| 500 | `persist_failed` + `lumaId` | Generation was billed and succeeded; re-poll the `lumaId` within 1 hour for a fresh presigned URL |

Gotchas the code can't confess:

- Luma's presigned output URL expires in **1 hour**; on `persist_failed`, recover the paid output by re-polling before it dies.
- The poll deadline is 270s, not the route's 300s `maxDuration` — headroom so a timeout returns the `lumaId` instead of the platform killing the function mid-response.
- Preflight checks only that each url ref exists; content-type, the 50 MB size cap, Luma's 8,000 px-per-side cap, and `file_id` existence all surface as a Luma 422 before billing.

## Constraints

- Label the output as AI-generated anywhere it is shown.
- ~$0.04 per uni-1 generation, ~$0.07 with 9 refs. No free tier.
- Never call Luma from a browser with the real key; this route is the only caller.

## Quick checklist

```
Composite run:
- [ ] Every ref URL opens and renders an image
- [ ] LUMA_AGENTS_API_KEY and PIPELINE_SECRET present in the target env
- [ ] curl returns 200 with { id, url }
- [ ] Blob URL renders the composite
```

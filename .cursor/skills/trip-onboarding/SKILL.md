---
name: trip-onboarding
description: Guide for adding new trips to the personal website. Use when onboarding a trip, uploading travel photos, adding to Vercel Blob, or troubleshooting why new trip content isn't appearing.
disable-model-invocation: true
---

# Trip Onboarding

Add a trip with the repo scripts. They write `media/trips/` and upload to Vercel Blob. Do not upload through the Vercel Dashboard, and do not run a hand-written `sips` loop.

`sips` still runs inside the scripts (macOS). `pnpm trip:onboard` converts HEIC files it finds in the source folder. For a one-off conversion outside that flow, use `pnpm heic:convert`.

## Commands

### New trip: `pnpm trip:onboard`

Interactive. Loads `.env.local`, then `.env`, without overriding variables already set. Requires `ROBDLC_PERSONAL_WEBSITE_READ_WRITE_TOKEN`.

Prompts for year, full month name, slug, title, location, description, start date (`yyyy-mm-dd`), end date, optional comma-separated tags, and a source photo directory. The default source directory is `/Users/robertdelacruz/bin/website_photos/{slug}`.

Then it:

1. Converts `.heic` files in that directory to `.jpg` beside the originals (originals stay).
2. Requires at least one `.jpg` or `.jpeg`.
3. Refuses the trip if `media/trips/{year}_{slug}/trip.json` or Blob `trips/{year}/{slug}/` already exists.
4. Writes `media/trips/{year}_{slug}/trip.json` and updates `media/trips_index.json`.
5. Uploads each photo to `trips/{year}/{slug}/photos/`, `trip.json` to `trips/{year}/{slug}/trip.json`, and the index to `trips/trips_index.json` (index overwrite is allowed).

Cover behavior:

- A real run generates a Luma composite and installs it as `cover.jpg`. That is a paid call. It needs `PIPELINE_SECRET`, `COMPOSITE_API_URL`, and the Blob token before any work starts. The server at `COMPOSITE_API_URL` also needs `LUMA_AGENTS_API_KEY`.
- `--skip-cover` skips Luma. An existing `cover.jpg` in the source directory is reused; otherwise the script asks which JPG to copy to `cover.jpg`.
- `--dry-run` writes nothing, uploads nothing, and does not call Luma.

```bash
pnpm trip:onboard
pnpm trip:onboard --dry-run
pnpm trip:onboard --skip-cover
```

The script rejects a literal `--` argument. Pass flags directly.

### Replace a cover: `pnpm trip:cover`

Use when the image is already in this Blob store (for example a composite at `trips/composites/<lumaId>.jpg`).

```bash
pnpm trip:cover -- --image <blob-url-or-pathname> --trip <year>/<slug>
pnpm trip:cover -- --image <blob-url-or-pathname> --trip <year>/<slug> --dry-run
```

It checks that `trips/{year}/{slug}/photos/` already has blobs, fetches the image (the URL must be in this store), converts PNG to JPEG, and overwrites `trips/{year}/{slug}/photos/cover.jpg`. JPEG input is uploaded as-is. Missing `--image` or `--trip` falls through to prompts. This script accepts a literal `--` because pnpm forwards it.

### HEIC outside onboarding: `pnpm heic:convert`

```bash
pnpm heic:convert path/to/photo.HEIC
pnpm heic:convert path/to/photo.HEIC --out path/to/photo.jpg
pnpm heic:convert path/to/folder
pnpm heic:convert path/to/folder --out path/to/output-folder
pnpm heic:convert path/to/photo.HEIC --dry-run
```

Writes JPEG next to the source unless `--out` is set. Does not delete the HEIC files.

## Blob layout

```text
trips/
├── trips_index.json
└── {year}/
    └── {slug}/
        ├── trip.json
        └── photos/
            ├── cover.jpg
            └── ...
```

Local copies: `media/trips_index.json` and `media/trips/{year}_{slug}/trip.json`. See `media/trips/2024_new_york/trip.json`.

Trip pages prebuild known slugs and set `dynamicParams = true`, so a new trip can render without a redeploy. Trip fetches revalidate for 10 minutes (`tripService.ts`). After `trip:cover`, Blob edge purge can take about a minute; locally, hard-refresh or remove `.next/cache`.

## When it fails

- Missing `ROBDLC_PERSONAL_WEBSITE_READ_WRITE_TOKEN`.
- Real onboard without `PIPELINE_SECRET` or `COMPOSITE_API_URL` (use `--skip-cover` only when a generated cover is not wanted).
- Source directory has no JPG/JPEG after HEIC conversion.
- Trip already exists locally or under `trips/{year}/{slug}/` in Blob.
- `trip:cover` image URL is outside this store, or `trips/{year}/{slug}/photos/` is empty.
- `sips` is missing (the converters are macOS-only).

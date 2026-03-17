---
name: trip-onboarding
description: Guide for adding new trips to the personal website. Use when onboarding a trip, uploading travel photos, adding to Vercel Blob, or troubleshooting why new trip content isn't appearing.
---

# Trip Onboarding

Complete guide for adding new trips to robertdelacruz.com.

Use `pnpm trip:onboard` for the actual new-trip workflow. Keep this skill as the quick reference for what the script is doing behind the scenes and for troubleshooting if something does not appear correctly.

## Prerequisites

- Photos converted to JPG (not HEIC)
- Access to Vercel Dashboard (Blob Storage)
- A `cover.jpg` selected for the trip thumbnail

### Converting HEIC to JPG

```bash
cd /Users/robertdelacruz/bin/website_photos/{trip_slug}
for f in *.HEIC; do sips -s format jpeg "$f" --out "${f%.*}.jpg"; done
rm *.HEIC
```

---

## Onboarding Steps

### Step 1: Prepare Local Photos

> **Note:** Photos are stored locally on the Mac mini at `/Users/robertdelacruz/bin/website_photos/`.
> This is the historical location used for trip photo staging.

1. Create folder: `/Users/robertdelacruz/bin/website_photos/{slug}/`
2. Add all trip photos (JPG format)
3. Create thumbnail: `cp {best_photo}.jpg cover.jpg`

### Step 2: Upload to Vercel Blob

In Vercel Dashboard → Storage → Blob:

1. Navigate to `trips/`
2. Create folder structure: `{year}/{slug}/photos/`
3. Upload all JPGs including `cover.jpg`

**Final path:** `trips/{year}/{slug}/photos/`

### Step 3: Create trip.json

Create the trip detail file in two places:

1. **Local repo:** `media/trips/{year}_{slug}/trip.json` — commit to Git for version control
2. **Vercel Blob:** `trips/{year}/{slug}/trip.json` — upload via Dashboard

See example: [media/trips/2024_new_york/trip.json](../../../media/trips/2024_new_york/trip.json)

Note: `tags` are defined but not currently displayed in the UI (planned feature).

### Step 4: Update trips_index.json

Update in two places:

1. **Local repo:** `media/trips_index.json` — commit to Git for version control
2. **Vercel Blob:** `trips/trips_index.json` — download, add entry, re-upload

```json
{
  "year": 2025,
  "month": "January",
  "slug": "hawaii",
  "title": "Hawaii",
  "location": "Hawaii, USA",
  "description": "Your trip description",
  "photosPath": "trips/2025/hawaii/photos"
}
```

### Step 5: Clear Cache

After uploading, purge the cache:

- **Option A:** Vercel Dashboard → Settings → Data Cache → Purge Everything
- **Option B:** Run `vercel --prod` to redeploy

---

## Blob Structure Reference

```
trips/
├── trips_index.json           ← Master list (Step 4)
└── {year}/
    └── {slug}/
        ├── trip.json          ← Trip details (Step 3)
        └── photos/
            ├── cover.jpg      ← Required thumbnail
            ├── IMG_001.jpg
            └── ...
```

---

## Dynamic Routes: Why New Trips Work Without Redeployment

The trip detail page uses both `generateStaticParams` and `dynamicParams = true`:

| Config | Purpose |
|--------|---------|
| `generateStaticParams` | Pre-builds known trips at deploy time (~50ms CDN delivery) |
| `dynamicParams = true` | Allows new trips to render on-demand without code redeployment |

**Result:** Known trips are instant; new trips work immediately after cache purge (first request ~200-500ms, then cached).

See: `src/app/interests/[year]/[trip]/page.tsx`

---

## Troubleshooting: Content Not Appearing

### CDN Caching Issue (Most Common)

**Symptom:** Uploaded new content to Vercel Blob but website shows old/missing content for 10+ minutes.

**Cause:** Vercel's CDN and browser cache the blob URLs aggressively. The upload succeeds immediately, but:
- The URL is the same
- The edge/CDN has cached the old response
- The browser reuses the cached version

**This is not a bug** — it's expected CDN behavior.

### Solutions

| Method | How |
|--------|-----|
| **Purge Data Cache** | Vercel Dashboard → Settings → Data Cache → Purge Everything |
| **Redeploy** | Run `vercel --prod` |
| **Hard Refresh Browser** | Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows) |
| **Incognito Window** | Test in private browsing to bypass browser cache |

### Cache Duration

The app uses a 10-minute revalidation window (`revalidate: 600` in `tripService.ts`). After purging, content updates within the next request cycle.

### If Still Not Working

1. Verify blob paths are correct in Vercel Dashboard
2. Check `trips_index.json` contains the new trip entry
3. Ensure `cover.jpg` exists in the photos folder
4. Check browser console for 404 errors on specific assets

---

## Quick Checklist

```
Trip Onboarding:
- [ ] Photos converted to JPG
- [ ] cover.jpg created
- [ ] Photos uploaded to Vercel Blob: trips/{year}/{slug}/photos/
- [ ] trip.json created in media/trips/{year}_{slug}/ and uploaded to Vercel Blob
- [ ] trips_index.json updated in media/ and in Vercel Blob
- [ ] Local changes committed to Git
- [ ] Cache purged (Data Cache or redeploy)
- [ ] Verified in incognito/hard refresh
```

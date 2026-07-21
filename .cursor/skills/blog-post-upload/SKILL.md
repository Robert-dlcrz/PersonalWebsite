---
name: blog-post-upload
description: Publish local blog drafts to Vercel Blob for this personal website. Use when uploading, publishing, or troubleshooting blog posts under media/blog or Vercel Blob blog folders.
---

# Blog Post Upload

Use this workflow when publishing a blog post for `robertdelacruz.com`.

## Current Source of Truth

```text
media/blog/<slug>/post.md          ← local draft
media/blog/blog_index.json         ← local index (git)

blog/<slug>/post.md                ← Blob post body
blog/blog_index.json               ← Blob index (required for /blog list)
blog/<slug>/images/                ← optional Blob images
```

- `/blog` (list) reads **only** Blob `blog/blog_index.json`
- `/blog/<slug>` (detail) reads Blob `blog/<slug>/post.md`
- Local `media/` files are the git source of truth; Blob is what production serves

If the post has images, markdown should reference local relative paths:

```markdown
![Alt text](./images/example.jpg)
```

The app rewrites `./images/...` to the correct Vercel Blob URL at render time.

## Frontmatter

Every `post.md` needs YAML frontmatter:

```markdown
---
title: "Post Title"
date: 2026-05-15
excerpt: "Short summary for metadata and previews."
---
```

Required fields:

- `title`
- `date`
- `excerpt`

## Blog index

Every published post needs an entry in both:

1. **Local repo:** `media/blog/blog_index.json` — commit to Git
2. **Vercel Blob:** `blog/blog_index.json` — download, update, re-upload

Entry shape (must match `BlogPostSummary`):

```json
{
  "slug": "<slug>",
  "title": "Post Title",
  "date": "2026-05-15",
  "excerpt": "Short summary for the list page and metadata."
}
```

Rules:

- `slug` must match the folder name / route
- `title` / `date` / `excerpt` should match the post frontmatter
- `date` is `YYYY-MM-DD`
- The app sorts posts by date descending, so file order is not critical; keeping newest-first is still nice for humans
- Omit drafts (e.g. `hello-world`) until they are meant to be public

## Upload Steps

1. Finalize the local draft:

   ```text
   media/blog/<slug>/post.md
   ```

2. Update **local** `media/blog/blog_index.json` — add or replace the entry for this slug.

3. In Vercel Dashboard, open the project's Blob store.

4. Create or open the destination folder:

   ```text
   blog/<slug>/
   ```

5. Upload `post.md` into that folder.

6. If images exist, upload the full `images/` folder:

   ```text
   blog/<slug>/images/
   ```

7. Download current Blob `blog/blog_index.json` if it already exists (or start from the local file). Apply the same entry change, then re-upload to Blob path `blog/blog_index.json`.

8. Verify the public Blob URLs load:

   ```text
   https://avswwi5vtnxsddjy.public.blob.vercel-storage.com/blog/<slug>/post.md
   https://avswwi5vtnxsddjy.public.blob.vercel-storage.com/blog/blog_index.json
   ```

9. Verify the site routes:

   ```text
   /blog
   /blog/<slug>
   ```

## Important Notes

- Detail route still supports new slugs via `dynamicParams`, but **listing on `/blog` will not show a post until it is in `blog_index.json`**.
- Blob content can take a few minutes to appear because the app uses revalidation.
- If the old content still appears, hard refresh or purge the Vercel Data Cache.
- **Agent upload policy:** do not upload to Vercel Blob unless the user explicitly asks; tell the user what to upload (local path → Blob path → expected contents) instead. Same policy applies to `blog_index.json` and `post.md`.

## Quick Checklist

```text
- [ ] Frontmatter has title, date, excerpt
- [ ] Local draft saved under media/blog/<slug>/post.md
- [ ] Entry added/updated in media/blog/blog_index.json
- [ ] post.md uploaded to blog/<slug>/post.md in Vercel Blob
- [ ] Images, if any, uploaded to blog/<slug>/images/
- [ ] blog/blog_index.json updated and re-uploaded to Vercel Blob
- [ ] Public post URL loads
- [ ] Public index URL loads
- [ ] /blog lists the post
- [ ] /blog/<slug> renders on the site
```

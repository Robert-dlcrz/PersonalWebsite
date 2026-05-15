---
name: blog-post-upload
description: Publish local blog drafts to Vercel Blob for this personal website. Use when uploading, publishing, or troubleshooting blog posts under media/blog or Vercel Blob blog folders.
---

# Blog Post Upload

Use this workflow when publishing a blog post for `robertdelacruz.com`.

## Current Source of Truth

Blog posts are drafted locally under:

```text
media/blog/<slug>/post.md
```

Production blog posts are served from Vercel Blob under:

```text
blog/<slug>/post.md
```

If the post has images, upload them under:

```text
blog/<slug>/images/
```

Markdown images should reference local relative paths:

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

## Upload Steps

1. Finalize the local draft:

   ```text
   media/blog/<slug>/post.md
   ```

2. In Vercel Dashboard, open the project's Blob store.

3. Create or open the destination folder:

   ```text
   blog/<slug>/
   ```

4. Upload `post.md` into that folder.

5. If images exist, upload the full `images/` folder:

   ```text
   blog/<slug>/images/
   ```

6. Verify the public Blob URL loads:

   ```text
   https://avswwi5vtnxsddjy.public.blob.vercel-storage.com/blog/<slug>/post.md
   ```

7. Verify the site route:

   ```text
   /blog/<slug>
   ```

## Important Notes

- There is currently no required `blog/blog_index.json` workflow.
- A blog index may be added later, but do not block publishing on it today.
- The detail route supports new slugs because `/blog/[slug]` uses dynamic params.
- Blob content can take a few minutes to appear because the app uses revalidation.
- If the old content still appears, hard refresh or purge the Vercel Data Cache.

## Quick Checklist

```text
- [ ] Frontmatter has title, date, excerpt
- [ ] Local draft is saved under media/blog/<slug>/post.md
- [ ] post.md uploaded to blog/<slug>/post.md in Vercel Blob
- [ ] Images, if any, uploaded to blog/<slug>/images/
- [ ] Public Blob URL loads
- [ ] /blog/<slug> renders on the site
```

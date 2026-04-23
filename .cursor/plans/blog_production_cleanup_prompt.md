# Blog Production Cleanup — Prompt

## Ask

> Evaluate all the staged changes. Is there anything we can simplify, delete, remove for simplicity, etc.? It's time to clean up!
>
> Plan out **EVERYTHING** we can do to get this ready for production.

## Context

We just finished building the initial `/blog/<slug>` surface for the personal site, validated end-to-end with a single `hello-world` test post. Everything renders, the floating TOC rail works, images resolve from Vercel Blob, and the entrance animation feels right.

Now we need a production pass on the staged diff — dead deps, YAGNI fields, simplification opportunities, hardening, docs — before the branch gets committed.

### What was built

- `/blog/[slug]` dynamic route (Next.js App Router, RSC) — `src/app/blog/[slug]/page.tsx`.
- Markdown pipeline running server-side via `unified` (`remark-parse` → `remark-gfm` → `remark-rehype` → `rehype-slug` → relative-image rewriter → `rehype-pretty-code` → `rehype-stringify`) — `src/components/blog-layouts/BlogMarkdown.tsx`.
- Frontmatter parsed with `gray-matter`; `BlogService` singleton mirroring `TripService` — `src/service/blogService.ts`.
- Floating Stripe/Linear-style TOC rail with IntersectionObserver + motion dots — `src/components/blog-layouts/BlogTocRail.tsx`.
- Animated hero/body layout matching the rest of the site — `src/components/blog-layouts/BlogPage.tsx`.
- Shared `BlobClient.getText()` added alongside `getJson()` — `src/persistence/blobClient.ts`.
- Blog markdown typography in `src/app/globals.css` under `.blog-markdown` selectors.

### Authoring model

Content lives in Vercel Blob:

```
blog/
  <slug>/
    post.md           # YAML frontmatter + markdown body
    images/
      <anything>.jpg  # referenced via ./images/... in post.md
```

Frontmatter schema (current):

```yaml
---
title: "Hello, World"
date: 2026-04-21
excerpt: "First post. Validating the whole pipeline."
---
```

### Staged diff (13 files)

```
package.json
pnpm-lock.yaml
src/app/blog/[slug]/page.tsx              (new)
src/app/globals.css                       (modified — .blog-markdown typography)
src/components/blog-layouts/BlogMarkdown.tsx  (new)
src/components/blog-layouts/BlogPage.tsx      (new)
src/components/blog-layouts/BlogTocRail.tsx   (new)
src/model/BlogPost.ts                     (new)
src/model/BlogPostRecord.ts               (new)
src/persistence/blobClient.ts             (modified — added getText)
src/service/blogMarkdown/extractSections.ts       (new)
src/service/blogMarkdown/rewriteRelativeImages.ts (new)
src/service/blogService.ts                (new)
```

### Known smells before the cleanup pass

- `react-markdown` is still in `package.json` but the runtime switched to a direct `unified` pipeline — unused dep.
- `tags` field parsed from frontmatter but never rendered.
- `BlogTocRail` uses a `passedIdsRef` + `passedVersion` counter + hidden `<span data-passed-version>` to force re-renders — mutable-ref-as-state anti-pattern.
- Blog animation tuning constants live inline instead of in `src/constants/motion.ts` next to `HOME_ENTRANCE`.
- No slug validation on the dynamic route — combined with `dynamicParams = true`, any string reaches the blob fetch.
- No per-post `generateMetadata` — SEO falls back to the generic root title.
- No `blog-onboarding` skill analogous to `trip-onboarding` for future authors.

### Constraints / invariants to preserve

- Styling parity with `src/app/page.tsx` and `src/components/trip-layouts/TripPage.tsx`.
- Backend patterns must mirror `tripService` (singleton-via-globalThis, `BlobClient` usage).
- URL structure stays `/blog/<slug>`.
- New posts must go live without redeployment (`dynamicParams = true` + `generateStaticParams` for the known set).
- Markdown rendering and syntax highlighting stay on the server — zero shiki/unified shipped to the client bundle.

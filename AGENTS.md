# AGENTS.md

## Cursor Cloud specific instructions

This is a Next.js 16 personal portfolio site using pnpm (enforced via `.npmrc` + `preinstall` script — npm/yarn will fail).

### Running the dev server

```bash
BLOB_BASE_URL=https://avswwi5vtnxsddjy.public.blob.vercel-storage.com pnpm dev
```

The `BLOB_BASE_URL` env var is required for the `/interests` and `/blog` pages (trip and blog data fetched from Vercel Blob). The public blob hostname is already hardcoded in `next.config.ts` for image optimization, so reuse it. Without it, the homepage still works but `/interests` and `/blog` will error. The blog list also needs Blob `blog/blog_index.json`; individual posts need `blog/<slug>/post.md`.

The `ROBDLC_PERSONAL_WEBSITE_READ_WRITE_TOKEN` env var is needed for listing trip photos via `@vercel/blob` `list()`. Without it, trip detail pages render but show no photo gallery. The code handles this gracefully (try/catch returns empty array).

### Lint / Build / Test

- **Lint:** `pnpm lint` — runs ESLint 9 with `eslint-config-next`.
- **Build:** `BLOB_BASE_URL=https://avswwi5vtnxsddjy.public.blob.vercel-storage.com pnpm build` — runs **`pnpm test`** (Vitest + coverage) first, then `next build`. `BLOB_BASE_URL` is required at build time because `generateStaticParams` fetches trip data. To compile only without tests: `pnpm build:next`.
- **Test:** `pnpm test` — same suite the build runs first; Vitest with **coverage** (V8); open `coverage/index.html` for the HTML report. Coverage is collected for all app source under `src/` (`.ts` and `.tsx`); not every file is exercised by tests, so low or zero coverage in some areas is expected.
- **E2E (local):** `pnpm test:e2e` with no env vars — Playwright builds and serves the app itself (first run: `pnpm exec playwright install chromium`).
- **E2E (ad-hoc against a deployed preview):** `E2E_BASE_URL=https://<preview>.vercel.app VERCEL_AUTOMATION_BYPASS_SECRET=<secret> pnpm test:e2e` — must be a `*.vercel.app` host and the secret is required; `playwright.config.ts` rejects anything else at config load. In GitHub, the E2E workflow can also be run on demand via **Actions → E2E → Run workflow** with a preview URL.

### Key scripts

See `package.json` `scripts` section for `dev`, `build`, `build:next`, `start`, `lint`, `test`.

### Project skills

Task playbooks live in `.cursor/skills/<name>/SKILL.md`. Read the matching one before improvising:

- **Trip onboarding** (`trip-onboarding`) — adding a trip, uploading travel photos to Blob, or new trip content not appearing.
- **Blog publishing** (`blog-post-upload`) — uploading or troubleshooting blog posts under `media/blog` or Blob `blog/` folders.
- **Vercel config** (`vercel-config`) — environment variables, deploys, or Vercel project settings.
- **Branch cleanup** (`git-branch-cleanup`) — deleting merged branches, pruning origin refs, or checking whether a PR picked up new commits.
- **Production cleanup** (`production-code-cleanup`) — hardening code, auditing staged changes, or matching prior refactor patterns.
- **Machine setup** (`initial-setup`) — bootstrapping Homebrew and Node on a fresh Mac.

### pnpm build scripts warning

After `pnpm install`, you may see a warning about ignored build scripts for `sharp` and `unrs-resolver`. This does not block dev or build. Do not run `pnpm approve-builds` (interactive).

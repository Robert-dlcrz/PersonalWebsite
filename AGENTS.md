# AGENTS.md

## Cursor Cloud specific instructions

This is a Next.js 16 personal portfolio site using pnpm (enforced via `.npmrc` + `preinstall` script — npm/yarn will fail).

### Running the dev server

```bash
BLOB_BASE_URL=https://avswwi5vtnxsddjy.public.blob.vercel-storage.com pnpm dev
```

The `BLOB_BASE_URL` env var is required for the `/interests` pages (trip data fetched from Vercel Blob). The public blob hostname is already hardcoded in `next.config.ts` for image optimization, so reuse it. Without it, the homepage and `/music` still work but `/interests` will error.

The `ROBDLC_PERSONAL_WEBSITE_READ_WRITE_TOKEN` env var is needed for listing trip photos via `@vercel/blob` `list()`. Without it, trip detail pages render but show no photo gallery. The code handles this gracefully (try/catch returns empty array).

### Lint / Build / Test

- **Lint:** `pnpm lint` — runs ESLint 9 with `eslint-config-next`.
- **Build:** `BLOB_BASE_URL=https://avswwi5vtnxsddjy.public.blob.vercel-storage.com pnpm build` — `BLOB_BASE_URL` is required at build time because `generateStaticParams` fetches trip data.
- **Test:** No test framework is installed (Jest is mentioned in project docs but not configured). No test files exist.

### Key scripts

See `package.json` `scripts` section for `dev`, `build`, `start`, `lint`.

### pnpm build scripts warning

After `pnpm install`, you may see a warning about ignored build scripts for `sharp` and `unrs-resolver`. This does not block dev or build. Do not run `pnpm approve-builds` (interactive).

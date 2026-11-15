# robertdelacruz.com

Robert De La Cruz's personal and technical showcase.

Next.js 16, TypeScript, and Tailwind CSS, deployed on Vercel. Trip and blog content is served from Vercel Blob.

## Develop

Node.js 26 (`engines.node` is `26.x`, `.node-version` is `26`) and pnpm (`packageManager` is pnpm 10). `.npmrc` sets `engine-strict=true`; npm and yarn will not install.

```bash
pnpm install
pnpm dev
pnpm lint
pnpm test
pnpm build
```

`pnpm dev` and `pnpm build` need `BLOB_BASE_URL`. Agent setup, env vars, and the other scripts are in [AGENTS.md](./AGENTS.md).

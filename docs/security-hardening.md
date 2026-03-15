# Security hardening notes

Last updated: 2026-03-15

## What changed

- Added a site-wide header policy in `next.config.ts`.
- Added a site-wide Content Security Policy (CSP) in `next.config.ts`.
- Replaced the placeholder SoundCloud link in `src/constants/content.ts`.

## Header decisions

- `Strict-Transport-Security`: enabled only in production. HSTS is useful only over HTTPS, and omitting it in local development avoids confusing localhost testing behavior.
- `X-Frame-Options: DENY`: the site does not need to be framed, so blocking framing reduces clickjacking risk.
- `X-Content-Type-Options: nosniff`: prevents MIME sniffing for static assets.
- `X-XSS-Protection: 1; mode=block`: included for legacy browser compatibility because it was explicitly requested in the TODO, even though modern browsers primarily rely on CSP.
- `Referrer-Policy: strict-origin-when-cross-origin`: keeps full referrers on same-origin navigation while limiting cross-origin leakage.
- `Permissions-Policy`: disables browser capabilities the site does not use, such as camera, microphone, geolocation, USB, and payment APIs.

## CSP decisions

The policy is intentionally strict on remote origins and permissive only where the current Next.js app needs it:

- `default-src 'self'`: default deny of third-party origins.
- `img-src`: allows self, `data:`, `blob:`, and the Vercel Blob hostname used for trip images.
- `style-src 'self' 'unsafe-inline'`: static CSS is self-hosted, but inline styles are still allowed because Next.js/runtime libraries can inject them.
- `script-src 'self' 'unsafe-inline'`: a static header-based CSP cannot attach per-request nonces, and Next.js uses inline runtime scripts. This is weaker than a nonce-based CSP, but still blocks third-party script origins.
- `script-src` adds `'unsafe-eval'` only in development: this keeps the local Next.js dev runtime working while avoiding it in production.
- `connect-src`: allows self plus the Vercel Blob hostname and local dev websocket/http endpoints for hot reload.
- `frame-ancestors 'none'`, `object-src 'none'`, and `base-uri 'self'`: tighten common XSS and injection vectors.
- `upgrade-insecure-requests`: enabled only in production so local HTTP development is not upgraded unexpectedly.

### Future improvement

If you want a stricter production CSP later, move CSP generation to middleware and add per-request nonces for scripts/styles. That would allow removal of `'unsafe-inline'` from `script-src`.

## SoundCloud URL assumption

The placeholder `https://soundcloud.com` was replaced with:

- `https://soundcloud.com/robert-dela-cruz-465324732`

Reasoning:

- Public search results matched this profile most closely to the site owner name, "Robert De La Cruz".
- No more authoritative SoundCloud URL existed in the repository.

If this is not the intended profile, replace the URL in `src/constants/content.ts`.

## Maintenance follow-up

- `pnpm audit`: pending
- Dependency freshness review: pending
- Vercel security settings review: pending

Recommended Vercel settings to confirm manually:

- Enforce HTTPS for the production domain and any aliases.
- Review environment variable scope so read/write blob tokens are limited to the environments that need them.
- Verify preview and production domains are expected and no stale custom domains remain attached.

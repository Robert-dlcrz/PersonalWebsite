---
name: production-code-cleanup
description: Guides production cleanups for this repo: user-led checklists, Next.js Blob-backed routes, client payload boundaries, utils vs services, a11y/lint alignment, tests, and maintainer comments. Use when cleaning up or hardening code, auditing staged changes, or matching prior blog/route refactors.
---

# Production code cleanup

## Mindset

- Treat cleanup as **collaborative**. In practice, the **user often supplies the findings**; the model’s first pass is a draft. **Do not** present an audit as complete without an explicit check-in.
- Prefer **numbered or itemized decisions** (approve / defer / reject per item) so scope stays under control.
- Prefer **small, reviewable diffs**. When the user says **“only this”** or **“barebones”**, implement the **minimal** change set and avoid extra “while we’re here” edits.
- After a pass, **invite** gaps: naming, security, a11y policy, data ownership, perf.

## Thread-derived patterns (when the model had to circle back)

These came from places the first implementation was wrong, incomplete, or conflicted with lint—**use as guardrails**.

### Next.js App Router + Blob-backed content

- **`dynamicParams`**: Prefer **explicit** `export const dynamicParams = true` when sibling routes (e.g. trips) do the same, even if defaults might allow dynamic slugs—avoids accidental regressions. Add a **short comment** tying it to **Blob**: new slugs should work without redeploy or build-time enumeration.
- **`generateStaticParams`**: **Never** ship **hardcoded** slug lists (e.g. `hello-world`) as the source of truth. Build the list from the **same bucket/index** the app uses, or return `[]` with a **safe fallback** when the index is missing—**log clearly** (e.g. missing `blog_index.json`).
- **Duplicate fetches** (`generateMetadata` + page): Deduplicate with **`react`'s `cache()`** (or equivalent) for the same request; **comment why** so future maintainers know it is intentional request-scoped reuse, not accidental coupling.
- **`generateMetadata`**: Add a **brief comment** that Next calls it for `<title>` / meta (helps backend-oriented readers).

### Client vs server boundaries (`'use client'`)

- **Do not** pass **large server-only fields** (e.g. full **markdown body**) into client components if the body is already rendered on the server—wastes payload and leaks content into the client bundle. Pass a **small view model** (`title`, `date`, `excerpt`, `sections`, etc.).
- Prefer **`const { markdown, slug: postSlug, ...pagePost } = post`** (or equivalent) so **props are not hand-copied** and **slug** comes from the loaded entity where needed—avoids unused vars and drift.

### React correctness

- **Refs read during render** (e.g. `ref.current` to drive UI): **eslint will fail**; use **`useState`** (or a pattern that is render-safe). Don’t fight the rule with version counters unless there is a strong reason.

### Data placement: `src/utils` vs `src/service`

- **Utils** (`src/utils`): **pure** helpers—date normalization, blob URL resolution, markdown **parsing** / **rehype** plugins, AST walks, slug/id extraction. **No** React, **no** singletons. Easy to **unit test**.
- **Services** (`src/service`): **orchestration** and **I/O** (Blob client, `BlogService`, fetch/post composition). When the user asks to **colocate** domain rules with a service, **static methods** on the service class can replace tiny one-off modules (e.g. slug validation)—**grep** and migrate imports, then **delete** deprecated files.
- **Moving code**: When lifting logic out of a service file, **move** (don’t copy) and **preserve or improve** the **comment** explaining **why** (e.g. YAML `date` → string normalization for server/client boundaries).
- **File organization**: Prefer **`dateUtils.ts`**, **`blogUtils.ts`**, **`blob.ts`** over a deep `service/blogMarkdown/` tree when logic is **framework-agnostic**.
- **Constants** (`RELATIVE_IMAGE_PREFIX`, etc.): Keep **at top of module** when the user wants scanability; don’t bury magic strings mid-file.
- **Non-obvious guards** (e.g. “safe relative image path”): Add a **short comment** on **threat model** / intent so the next reader doesn’t rip it out.

### Styles

- Large, feature-specific blocks in **`globals.css`**: Prefer **colocated CSS** (e.g. **CSS modules** next to the component) when the user wants isolation and shorter global files.

### Motion / design tokens

- **Animation timings and easings**: Centralize in **`src/constants/motion.ts`**; **import** in components instead of duplicating numeric tuples.

### Accessibility + ESLint

- Prefer **spec-correct ARIA** over redundant **sr-only** copy when they mean the same thing (e.g. position in set → **`aria-posinset` / `aria-setsize`**).
- **Run `pnpm lint`**: `jsx-a11y` may forbid attributes on **`role="link"`** that are valid on **`listitem`**. Put attributes on the **supported element** (often **`<li>`** in an **`<ol>`**) and **explain** the tradeoff if the user expected them on the anchor.

### TypeScript + globals

- Before removing **`declare global`**, **`grep`** the symbol and confirm **no** other file relies on untyped `globalThis.*`. Prefer a **local** `typeof globalThis & { [key]?: T }` cast at the singleton site; if the user questions it, **justify with evidence** (grep + behavior unchanged).

### Tests (Vitest + ESLint)

- **Shared env stubs** (`vi.stubEnv`): **one small helper** under `src/utils/__tests__/`, imported with **relative** paths (`./helper`) from sibling tests.
- Name registration helpers **`register*`** (not **`use*`**) so **`react-hooks/rules-of-hooks`** does not treat test setup as a React hook.
- **Coverage output** under `coverage/` can trigger **eslint warnings**; fix **eslintignore** or clean artifacts—don’t treat generated files as source regressions.

### Cursor artifacts

- **Do not delete** `.cursor/plans/` unless the user explicitly asks; the user removes plans when ready.
- If a plan says **“do not edit the plan file”**, respect it during execution.

### Documentation

- **Keep** long JSDoc, component commentary, and **model docblocks** unless the user asks to shorten them.
- **Do** add or refine **comments** when the user asks for **beginner-friendly** or **cross-stack** (backend ↔ frontend) explanations—not every line, but **framework hooks** and **data-shape contracts**.

## User preferences (summary)

- **Docs**: Preserve by default; expand when asked for clarity.
- **Plans**: Hands off; user deletes.
- **Utils**: Pure, testable, small modules; constants at top; comments on security/shape-sensitive helpers.
- **Verification**: **`pnpm lint`** and **`pnpm test`** after substantive edits.

## Suggested cleanup checklist

Use with the user; let them **strike or reorder**:

- [ ] **Approvals**: explicit per-item sign-off for anything risky or subjective.
- [ ] **Routes**: Blob/index alignment; no fake slugs; `dynamicParams` + comments; deduped fetch + comment.
- [ ] **Client payload**: minimal props to `'use client'`; destructure + rest where it avoids duplication.
- [ ] **React**: no ref reads during render; lint-clean.
- [ ] **Logic home**: utils vs service; deprecated modules removed after migrate.
- [ ] **Styles**: colocated CSS vs globals when blocks grow.
- [ ] **Motion**: shared constants, no duplicated easings.
- [ ] **a11y**: ARIA on roles ESLint allows; lint passes.
- [ ] **Types**: global augmentations only when needed; explain removals.
- [ ] **Tests**: shared stub helpers; `register*` naming; colocated imports.
- [ ] **Docs / comments**: keep prose; add where maintainers need context.
- [ ] **Plans**: leave `.cursor/plans/` alone unless user says otherwise.

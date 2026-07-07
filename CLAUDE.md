# CLAUDE.md — yaver-web

SvelteKit dashboard for **Yaver**. Sibling of the Go API repo **`yaver-api`**.

## Git & commits (IMPORTANT)
- Author every commit as **`ebnsina <ebnsina.me@gmail.com>`** — per-repo config:
  `git config user.name "ebnsina" && git config user.email "ebnsina.me@gmail.com"`.
- **Do NOT** add a `Co-Authored-By: Claude` trailer, and do NOT use any other identity.
- Remote uses the **`github-es`** SSH host alias (`git@github-es:ebnsina/yaver-web.git`).

## Stack
- SvelteKit (Svelte 5 runes) + TypeScript, Tailwind v4 (`@tailwindcss/vite`), pnpm.
- Talks to `yaver-api` over `/v1/*`, proxied by Vite in dev (`vite.config.ts`) so the
  browser stays same-origin and the httpOnly session cookie works. Override the API
  target with `VITE_API_TARGET`.

## Conventions
- All API calls go through `src/lib/api` (typed client, `credentials: 'include'`).
  The hand-written client is a placeholder for one generated from the API's OpenAPI spec.
- Auth is cookie-based; unauthenticated pages redirect to `/login`.

## Commands
- `pnpm dev` — dev server (proxies `/v1` → `http://localhost:8080`). Use `--port` if 5173 is taken.
- `pnpm run check` — svelte-check typecheck.
- `pnpm build` — production build.

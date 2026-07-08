# Yaver Web

SvelteKit dashboard for **Yaver** — the multi-channel customer-engagement
platform for e-commerce (voice IVR/VA, AI chat, WhatsApp / Messenger). This is
the merchant-facing control panel; it talks to the Go API in the sibling repo
**[`yaver-api`](../yaver-api)** over `/v1/*`.

## Stack

- **SvelteKit** with **Svelte 5 runes** + TypeScript
- **Tailwind v4** (`@tailwindcss/vite`)
- **pnpm**
- `openapi-fetch` + `openapi-typescript` — a typed client generated from the
  API's OpenAPI spec
- `@xyflow/svelte` for the no-code flow builder canvas

## Dashboard surfaces

| Route | Purpose |
| --- | --- |
| `/login` | Phone-OTP login |
| `/` | Overview / analytics home |
| `/calls`, `/calls/[id]` | Call history and detail |
| `/inbox`, `/inbox/[id]` | Conversations + human takeover |
| `/chat` | AI chat widget settings |
| `/campaigns` | Bulk outbound: CSV import, scheduling |
| `/flows`, `/flows/new`, `/flows/[id]` | No-code flow builder + simulator |
| `/customers` | Customer list + DND management |
| `/settings` | Org, API keys, channels, billing, webhooks |

## Getting started

### Prerequisites

- Node.js 20+
- pnpm
- The API running locally (see [`yaver-api`](../yaver-api)) — by default on
  `http://localhost:8080`

### Develop

```sh
pnpm install
pnpm dev          # dev server on :5173, proxies /v1 → http://localhost:8080
```

Vite proxies `/v1`, `/public`, and `/widget.js` to the API so the browser stays
same-origin and the httpOnly session cookie works. Override the API target with
`VITE_API_TARGET`:

```sh
VITE_API_TARGET=https://api.staging.yaver.app pnpm dev
```

### Regenerate the typed API client

The client under `src/lib/api` is generated from the API's served OpenAPI spec:

```sh
pnpm gen:api      # reads ${VITE_API_TARGET:-http://localhost:8080}/openapi.yaml
```

## Commands

```sh
pnpm dev          # dev server (add --port if 5173 is taken)
pnpm build        # production build
pnpm preview      # preview the production build
pnpm check        # svelte-check typecheck
pnpm gen:api      # regenerate src/lib/api/schema.d.ts from the OpenAPI spec
```

## Conventions

- All API calls go through `src/lib/api` (typed client, `credentials: 'include'`).
- Auth is cookie-based; unauthenticated pages redirect to `/login`.

## Deployment

Uses `@sveltejs/adapter-node` — `pnpm build` emits a standalone server in
`build/`, run with `pnpm start` (or `node build`). A `Dockerfile` builds a
production image:

```sh
docker build -t yaver-web .
docker run -p 3000:3000 yaver-web
```

`adapter-node` listens on `$PORT` (default 3000). In production put a reverse
proxy in front that routes `/v1`, `/public`, and `/widget.js` to the API, so the
browser stays same-origin and the httpOnly session cookie stays first-party.

## License

Proprietary — © Yaver. All rights reserved.

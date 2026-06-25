# Frontend — React + Vite

Reusable React frontend for the NestJS full-stack template. It runs as its own
app and calls the NestJS API **cross-origin** (the backend does not serve it).

## What it does

- Loads runtime config from `public/config.json` (fallback `public/config.example.json`).
- Reads `api.base_url` to know where the NestJS API lives (default `http://localhost:3000`).
- Uses React Router for a small starter UI.
- Talks to the NestJS example API (`/api/template-items`, `/api/template/meta`).
- Builds to `dist/` (deploy to any static host: Nginx, Netlify, S3/CloudFront, etc.).

Styling note: the example UI is styled mostly through `src/index.css`. Tailwind
is configured and available if you want utility classes later.

## Run

```bash
cd Frontend
npm install
npm run dev      # http://localhost:5173
```

> Start the backend too (`cd Backend && npm run dev`) so API calls resolve.
> PowerShell note: if `npm` is blocked by execution policy, use `npm.cmd`.

Build for static hosting:

```bash
npm run build    # outputs to dist/
npm run preview  # serve the production build locally
```

## Starter pages

- `/` — template overview + live backend status (calls `/api/template/meta`)
- `/items` — small CRUD example wired to `/api/template-items`

## Config — pointing at the API

```json
{
  "app": { "name": "FullStack Template", "subtitle": "..." },
  "api": { "base_url": "http://localhost:3000" }
}
```

- `api.base_url` is the **origin of the NestJS API**. Because frontend and
  backend run separately, this is normally set (unlike the Fastify template,
  which served the frontend from the same origin).
- The backend must allow this frontend's origin in `cors.origins`
  (`Backend/config.json`) — `http://localhost:5173` by default.
- `config.json` is fetched at runtime (not baked into the JS bundle), so you can
  repoint a built/deployed frontend at a different API by editing that one file.

### Two ways to reach the API

**A. Cross-origin (default).** `api.base_url = "http://localhost:3000"`. The
browser calls the API directly; the backend allows the frontend origin via CORS.
Nothing else to configure.

**B. Same-origin via Vite dev proxy (no CORS).** Prefer to avoid cross-origin in
dev? Do both of these:

1. In `Frontend/public/config.json`, set `"api.base_url": ""` — `apiUrl()` then
   falls back to the current origin (the Vite dev server).
2. In `Frontend/vite.config.ts`, uncomment the `server.proxy` block:
   ```ts
   server: {
     host: true,
     port: 5173,
     proxy: { '/api': { target: 'http://localhost:3000', changeOrigin: true } },
   },
   ```

Now `/api/...` requests hit Vite (`:5173`) and are proxied to the backend
(`:3000`) — same origin, so CORS never applies. (This only affects `npm run dev`;
a production static build still uses `api.base_url`.)

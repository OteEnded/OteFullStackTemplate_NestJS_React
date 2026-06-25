# Project guide for AI coding assistants

This repo was created from **Ote's NestJS + React full-stack template**. The
backend (NestJS, default port **3000**) and frontend (React + Vite, default port
**5173**) run as **separate apps** and talk over HTTP + CORS.

## START HERE — confirm ports before doing anything else

Before writing or changing any code for a new project built from this template,
**ask the developer to confirm the two server ports**:

1. **Backend (API) port** — default `3000`
2. **Frontend (dev server) port** — default `5173`

Ask explicitly, e.g.: *"Before we start — what ports should the backend and
frontend run on? Defaults are 3000 (API) and 5173 (frontend). Keep them or
change?"* Wait for their answer. If they keep the defaults, do nothing. If they
change either port, **apply the changes across all the files below yourself** —
the ports are wired in more than one place and must stay in sync.

### Where each port lives (update ALL matching entries when a port changes)

If the **backend port** changes to `<API>`:
- `Backend/config.json` → `app.port` = `<API>`
- `Frontend/public/config.json` → `api.base_url` = `http://localhost:<API>`
  (this is how the frontend finds the API — they're on different origins)
- `Frontend/public/config.example.json` → same `api.base_url` (keep in sync)

If the **frontend port** changes to `<WEB>`:
- `Frontend/vite.config.ts` → `server.port` = `<WEB>`
- `Backend/config.json` → `cors.origins` must include `http://localhost:<WEB>`
  (otherwise the browser's API calls are blocked by CORS)
- `Backend/config.example.json` → keep `cors.origins` in sync

Notes:
- `Backend/config.json` is gitignored (local). `*.example.json` files are
  committed — update both so a fresh clone inherits the right defaults.
- Env vars override config at runtime: `PORT`, `CORS_ORIGINS`,
  `DATABASE_*`, `AUTH_JWT_SECRET` (see `Backend/.env.example`).
- After changing ports, restart the dev servers (`run.bat`, or `npm run dev` in
  each folder).

## Quick orientation

- **Backend:** NestJS 11 + TypeORM 0.3 + PostgreSQL. Routes under `/api`. Swagger
  at `/api/docs`. Entities use a `uuid` primary key + an auto-increment
  `rollingId` (see `Backend/src/database/entities/base.entity.ts`).
- **DB:** `database.synchronize` defaults to **false** — run `npm run migration:run`
  to create tables, or set `DATABASE_SYNCHRONIZE=true` for auto-sync while
  prototyping. Schema is config-driven (`database.connection.schemas`).
- **Auth:** optional JWT example in `Backend/src/modules/auth/` (demo user
  `admin` / `changeme`). Remove it and the `User` entity if unused.
- **API contract:** every response is `{ ok, data }` or `{ ok: false, message }`.
- **Tests:** `npm test` (Jest) in `Backend/`.
- More detail: `README.md`, `Backend/README.md`, and `AI_CarryOn.md`.

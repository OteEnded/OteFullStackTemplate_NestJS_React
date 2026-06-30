# AI_CarryOn.md

> Purpose: short handoff for the project being built from this template.
> Last updated: 2026-06-25

## Current Goal

Replace this section when you start a real project from this template.

Suggested starting content:

- What is the current feature or milestone?
- Which area is actively being changed right now?
- What should the next AI agent continue without re-discovering?

## Current State

Use this file for short, high-signal handoff notes only. Put long implementation
history in `AI_ProgressTracking.md`.

## Onboarding (for AI coding assistants)

- **First, confirm server ports with the dev** (backend default 3000, frontend
  default 5173) before doing other work, then apply any change across the config
  files. Full instructions + the port→file map are in `CLAUDE.md` at the repo root.

## Template Baseline

- `Backend/` is a standalone NestJS + TypeORM API (port 3000, routes under `/api`).
- `Frontend/` is a standalone React + Vite SPA (port 5173 in dev).
- They run **separately** and talk over HTTP + CORS (this is the key difference
  from the Fastify + React template, where Fastify served the React build).
- Frontend learns the API origin from `Frontend/public/config.json` (`api.base_url`).
- Backend allows the frontend origin via `cors.origins` in `Backend/config.json`.
- Database (PostgreSQL via TypeORM) is **enabled by default**. Schemas are
  config-driven (`database.connection.schemas: { parent, project }`); `project`
  is the default and is auto-created on boot. Per-table schema selection works
  via `@Entity({ schema: SCHEMAS.project | SCHEMAS.parent })` (see
  `Backend/src/database/schemas.ts`) — mirrors the Fastify `public`/`project`
  split. Local config currently uses `project = template_builder`.
- **Entity keys:** all entities extend `BaseEntity` — `uuid` primary key
  (`gen_random_uuid()`, no extension) + auto-increment `rollingId` (unique
  secondary index) + `createdAt`/`updatedAt`. Routes use `:uuid` (ParseUUIDPipe).
- ORM is **TypeORM** (TS-first, idiomatic for Nest, entity-aware migrations). You
  are free to use **Sequelize** instead via the official `@nestjs/sequelize`
  package if you prefer it — the rest of the template is ORM-agnostic. See
  `Backend/README.md` ("ORM choice") for how to swap.
- **Migrations:** `database.synchronize` defaults to **false**; schema changes go
  through TypeORM migrations. An initial `InitSchema` migration (template_items +
  users) is committed. Prod/CI flow: `build` → `migration:run` → `start:prod`.
  Local dev can set `DATABASE_SYNCHRONIZE=true` to auto-sync instead.
- **Auth (optional example):** JWT module in `Backend/src/modules/auth/`
  (`@nestjs/jwt` + bcryptjs). Endpoints `POST /api/auth/register|login`,
  `GET /api/auth/me` (protected via `JwtAuthGuard`). Demo user seeded on boot:
  `admin` / `changeme` (`auth.seed_demo_user`). Set `AUTH_JWT_SECRET` + disable
  demo user in production. Removable with the `User` entity.
- **Health & logging:** `/api/health` uses `@nestjs/terminus` (real DB ping).
  Logging is `nestjs-pino` (pretty in dev, JSON in prod; request auto-logging via
  `logging.requests`; auth header/password redacted) — set up in `app.module.ts`,
  wired in `main.ts` via `app.useLogger`.
- **Tests:** `npm test` (Jest) — 10 unit tests (template-item service, health,
  auth controller), no DB needed. `npm run test:e2e` — 5 supertest e2e tests that
  boot the app (needs a running, migrated DB).
- **Frontend auth:** `Frontend/src/pages/LoginPage.tsx` + `src/auth.ts` exercise
  login + the protected `/me` route (token in localStorage).
- Example endpoints:
  - `GET /api/health` (real DB ping)
  - `GET /api/template/meta`
  - `GET|POST /api/template-items`, `POST /api/template-items/:uuid` (update) — REST surface is GET + POST only
  - `POST /api/auth/register|login`, `GET /api/auth/me`
- Swagger UI at `/api/docs`.
- `npm run dev` (backend, watch) / `npm run dev` (frontend) / `run.bat` (both on Windows).
- Production: `npm run build` → `npm run migration:run` → `npm run start:prod` (no Docker — removed per Ote's decision).

## Key Files

- `Backend/src/main.ts` — bootstrap (CORS, `/api` prefix, validation, Swagger, filters)
- `Backend/src/config/configuration.ts` — config.json + env overrides
- `Backend/src/database/` — TypeORM module, data-source, entities (TemplateItem, User), seeds, migrations (InitSchema), `schemas.ts` (per-entity schema constant)
- `Backend/src/modules/template-item/` — example resource to replace
- `Backend/src/modules/auth/` — optional JWT auth example (remove if unused)
- `Backend/config.example.json` — committed config template
- `Frontend/src/config.ts` — API base-URL resolution
- `Frontend/public/config.json` — runtime API origin
- `Frontend/src/pages/ExampleItemsPage.tsx` — example CRUD UI

## Verification State

- The template baseline is verified working (backend build + `npm test` +
  `npm run test:e2e`, migration → boot → seed, auth flow, CORS, frontend build).
- Replace this section with verification notes for YOUR derived project.

## Git State

- Replace this section with your derived project's git state. (The template
  baseline lives at `OteEnded/OteFullStackTemplate_NestJS_React`.)

## Commit Message Policy (suggested, matches the Fastify template)

- `OteEnded[feat]: ...`, `OteEnded[fix]: ...`, `OteEnded[refactor]: ...`,
  `OteEnded[docs]: ...`, `OteEnded[chore]: ...`
- Commit only when explicitly asked; re-check `git status` to keep `config.json`,
  `.env`, and build output out of commits.

## Suggested Next Steps

1. Replace the example `TemplateItem` module with the real domain.
2. Update this file with the actual current goal and state.
3. Append detailed work history in `AI_ProgressTracking.md`.

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
- **Tests:** `npm test` (Jest) — 11 unit tests (template-item service, health
  controller, auth controller). No DB required (repos/services mocked).
- Example endpoints:
  - `GET /api/health` (real DB ping)
  - `GET /api/template/meta`
  - `GET|POST /api/template-items`, `PATCH /api/template-items/:id`
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

- Verified on 2026-06-22: backend builds, connects to PostgreSQL 17.7, creates the
  configured schema, syncs/seeds, serves all endpoints with the `{ ok, data }`
  contract. CORS preflight + GET confirmed for `http://localhost:5173`. Frontend
  builds clean.
- Verified on 2026-06-25: migration flow (`synchronize=false` → `migration:run`
  creates tables → boot seeders populate) works against `template_builder`;
  initial `InitSchema` migration applied; auth flow (register/login/me, 401/409/400)
  works with demo user; `npm test` = 11 passing. Sandbox now has only the
  `template_builder` schema (old `app_template` dropped).

## Git State

- Not yet a git repository. Replace this section with the live git state when
  the derived project begins.

## Commit Message Policy (suggested, matches the Fastify template)

- `OteEnded[feat]: ...`, `OteEnded[fix]: ...`, `OteEnded[refactor]: ...`,
  `OteEnded[docs]: ...`, `OteEnded[chore]: ...`
- Commit only when explicitly asked; re-check `git status` to keep `config.json`,
  `.env`, and build output out of commits.

## Suggested Next Steps

1. Replace the example `TemplateItem` module with the real domain.
2. Update this file with the actual current goal and state.
3. Append detailed work history in `AI_ProgressTracking.md`.

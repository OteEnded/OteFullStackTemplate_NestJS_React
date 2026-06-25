# AI_ProgressTracking.md

> Purpose: append-only implementation history for the project built from this template.
> Keep newest entries at the bottom. Use real local time (PowerShell:
> `Get-Date -Format "yyyy-MM-dd HH:mm:ss K"`).

This file starts as the template baseline. When you begin a real project, keep
appending entries here and treat everything below as the starting point.

---

### 2026-06-22 12:14 — Template baseline created

- Summary: Created the NestJS + React full-stack template by reading the existing
  Fastify + React template and adapting its conventions to NestJS + TypeORM, with
  the backend and frontend running as separate apps.
- Backend: NestJS 11, TypeORM 0.3, PostgreSQL, class-validator, Swagger; config.json
  with env overrides; `app_template` Postgres schema; example `TemplateItem` module;
  health (DB ping) + meta endpoints; `{ ok, data }` response envelope; cron + websocket
  scaffolds.
- Frontend: copied from the Fastify template's React app, repointed to call the Nest
  API cross-origin via `public/config.json` (`api.base_url`), branding updated.
- Infra: `run.bat` (launches both dev servers), READMEs.
- Verification: backend builds and boots; connected to local PostgreSQL 17.7
  (`ote_sandbox@ote_sandbox:54322`); schema auto-created; tables synced; 3 rows seeded;
  all endpoints + validation + CORS confirmed; frontend builds clean.
- Next action: use this baseline for the next real project; replace the example module.

---

### 2026-06-22 13:30 — Enhanced run.bat; switched seed schema to template_builder; removed Docker

- `run.bat` now auto-installs deps on first run and launches both dev servers
  (backend watch + Vite HMR) in separate windows. Dev mode chosen (no frontend
  build step — Vite dev server hot-reloads and does not need a build).
- Switched `database.connection.schema` to `template_builder` and reseeded
  (3 rows). The earlier `app_template` schema still exists in the sandbox DB.
- Removed all Docker tooling per Ote's decision (no Dockerfiles, no
  docker-compose, no nginx.conf). Production runs the compiled build directly
  (`npm run build` + `npm run start:prod`). Docs updated accordingly.

---

### 2026-06-22 — Config-driven per-entity schema (public/project split)

- Replaced `database.connection.schema` (single string) with
  `database.connection.schemas: { parent, project }`, mirroring the Fastify
  template. `project` is the connection-level default schema.
- Added `src/database/schemas.ts` exporting a `SCHEMAS` constant (resolved from
  config at import time) so entities can pick a schema per table via
  `@Entity({ schema: SCHEMAS.project | SCHEMAS.parent })`. The example
  `TemplateItem` now sets `schema: SCHEMAS.project` explicitly.
- `ensure-schema.ts` now creates every configured non-`public` schema on boot.
- Updated `configuration.ts` types/loader (env: `DATABASE_SCHEMA` = project,
  `DATABASE_SCHEMA_PARENT` = parent), `typeorm-options.ts`, `.env.example`, and
  README/AI docs.
- Verified: build clean; seed re-ran; `template_items` confirmed in the
  `template_builder` schema with no leak into `public`.

---

### 2026-06-25 — Auth module, Jest tests, migrations/prod hardening, tidy-ups

- **Tidy:** added `.gitattributes` (text=auto eol=lf; `.bat` stays CRLF) and
  renormalized — removes the CRLF warnings. Added npm `overrides: { multer: ^2.2.0 }`,
  clearing the 8 high-severity multer advisories that cascaded across `@nestjs/*`.
  Remaining: 2 moderate `js-yaml` via @nestjs/swagger (accepted — Swagger doesn't
  parse untrusted YAML); Jest dev tooling adds more `js-yaml` instances but
  `npm audit --omit=dev` (what ships) stays at 2 moderate.
- **Auth example:** new `src/modules/auth/` — `User` entity (bcryptjs hash),
  `@nestjs/jwt`, `AuthService`, `AuthController` (register / login / me),
  `JwtAuthGuard` (no Passport), `@CurrentUser()` decorator, demo-user seeder
  (admin/changeme, gated by `auth.seed_demo_user`). Config gained an `auth` block
  (jwt_secret, jwt_expires_in, seed_demo_user) + env overrides. Removable.
- **Tests:** Jest + ts-jest; specs for template-item service (mocked repo),
  health controller (mocked DataSource/ConfigService), auth controller (mocked
  service + overridden guard). 11 tests, all passing, no DB needed.
- **Migrations / prod hardening:** `database.synchronize` now defaults **false**
  in both config files. Generated `InitSchema` migration (template_items + users,
  unique username index). Verified end-to-end: empty schema → `migration:run`
  creates tables → boot seeders populate → auth + items work. CLI uses
  `data-source.ts`. README documents build → migration:run → start:prod.
- **Tidy DB:** dropped the leftover `app_template` schema; sandbox now only has
  `template_builder`.
- Verified: `nest build` clean; `npm test` 11/11; full live API smoke (health,
  items CRUD, auth) green.

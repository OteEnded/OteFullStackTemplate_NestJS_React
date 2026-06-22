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

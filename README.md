# Ote's FullStack Template — NestJS + React

Reusable full-stack starter with a **NestJS + TypeORM** backend and a
**React + Vite** frontend that run as **two separate applications**.

Unlike the Fastify + React template (where Fastify serves the React build), here
the backend is a standalone API and the frontend is a standalone SPA. They
communicate over HTTP with CORS. This mirrors how most production teams deploy
(API and web hosted/scaled independently).

## Stack

- **Backend:** NestJS 11, TypeORM 0.3, PostgreSQL, class-validator, Swagger
- **Frontend:** React 19 + Vite, React Router
- **Database:** PostgreSQL (TypeORM, schema-scoped tables, migrations)
- **Auth:** optional JWT example module (`@nestjs/jwt` + bcryptjs) + a React login page
- **Observability:** terminus health checks (`/api/health`) + pino structured logging
- **Tests:** Jest unit tests + supertest e2e (`npm test` / `npm run test:e2e`)
- **Config:** `config.json` + environment-variable overrides
- **Prod:** `npm run build` → `npm run migration:run` → `npm run start:prod`
- **Extras:** cron (`@nestjs/schedule`) and WebSocket (`socket.io`) scaffolds

## Layout

```text
Backend/          NestJS API (port 3000, routes under /api)
Frontend/         React + Vite SPA (port 5173 dev)
wizard.bat / wizard.sh   run once after cloning — creates your root run script
scripts/          launchers/ (run-script templates), server_*, pull_*, pull_run_*
scripts/lib/      helper units (install_*, build_*) used by the above
AI_CarryOn.md / AI_ProgressTracking.md / AI_TemplateCreation.md
```

## Quick start (local dev)

1. **Backend**
   ```bash
   cd Backend
   npm install
   cp config.example.json config.json      # PowerShell: Copy-Item config.example.json config.json
   # edit config.json -> database.connection
   npm run migration:run                     # create tables (synchronize is off by default)
   npm run dev                               # http://localhost:3000/api
   ```
   (Prefer auto-sync while prototyping? Set `database.synchronize: true` in
   config.json and skip the migration step.)
2. **Frontend** (new terminal)
   ```bash
   cd Frontend
   npm install
   npm run dev                               # http://localhost:5173
   ```
3. Open `http://localhost:5173`. The overview page reads `/api/template/meta`;
   the Items page does live CRUD against `/api/template-items`.

Fastest path: run the **wizard** once, then use the run script it creates —
double-click **`wizard.bat`**, pick your OS, then double-click the generated
**`run_windows.bat`**. (Linux/macOS: `bash wizard.sh` then `bash run_linux.sh`.)
The wizard just copies a launcher from `scripts/launchers/` to the repo root, so
you end up with a single run file for your OS.

> PowerShell note: if `npm` is blocked by execution policy, use `npm.cmd`.

## Running on a server (production)

To host a clone on a server, use the **server** scripts in `scripts/` instead of
the dev launcher — they install, build backend + frontend, run migrations, then
run in production mode (Vite is configured to accept all hosts):

```bat
scripts\server_windows.bat        REM Linux/macOS: bash scripts/server_linux.sh
```

Keeping a deployed clone up to date:

```bat
scripts\pull_windows.bat          REM git pull only
scripts\pull_run_windows.bat      REM git pull, then build + run
```

For a long-running service, run the API under a process manager (pm2, or
nssm/Task Scheduler on Windows; systemd on Linux) rather than a console window,
and set `api.base_url` (Frontend) + `cors.origins` (Backend) for the public host.

## How the two apps connect

- The frontend reads `api.base_url` from `Frontend/public/config.json` at runtime
  (default `http://localhost:3000`) to know where the API is.
- The backend allows the frontend origin via `cors.origins` in
  `Backend/config.json` (default `http://localhost:5173`).
- Because the API URL is runtime config (not baked into the bundle), a built
  frontend can be repointed at a different API by editing one file.

## Database

- Enabled by default (this template is built around TypeORM + Postgres).
- Tables live in a configurable Postgres **schema** (`schemas.project`), created
  automatically on boot. Tables can opt into a different schema per entity (see
  `Backend/README.md` → "Per-entity schema").
- **Migrations by default:** `database.synchronize` defaults to `false`, so schema
  changes go through migrations. An initial `InitSchema` migration is included —
  run `npm run migration:run` to create the tables. (For quick local iteration you
  can set `DATABASE_SYNCHRONIZE=true` to auto-sync from entities instead.)
- The example `template_items` rows (and a demo auth user) are seeded on boot
  (idempotent); `template_items` can be reset with `npm run seed`.

## Included example feature

A small generic `TemplateItem` resource demonstrates the full path: React form
→ NestJS controller → DTO validation → service → TypeORM repository → Postgres.
Replace it with your real domain:

- `Backend/src/modules/template-item/` — controller, service, DTOs, seeder
- `Backend/src/database/entities/template-item.entity.ts` — entity
- `Frontend/src/pages/ExampleItemsPage.tsx` — the UI

There's also an optional **auth** example: `Backend/src/modules/auth/` (JWT) with a
`Frontend/src/pages/LoginPage.tsx` login page (demo user `admin` / `changeme`).
Remove both if your project doesn't need accounts.

## Suggested first changes for a new project

- Rename package names and app metadata (`package.json`, config `app.name`).
- Replace the `TemplateItem` module with your first real entity + module.
- Set `cors.origins` (backend) and `api.base_url` (frontend) for your domains.
- Add auth as a focused Nest module + guard if the project needs it.
- Remove the cron/websocket scaffolds if unused.

## AI tracking files

- `AI_CarryOn.md` — short current-state handoff for the implementing project
- `AI_ProgressTracking.md` — append-only implementation history
- `AI_TemplateCreation.md` — template-maintainer notes (gitignored)

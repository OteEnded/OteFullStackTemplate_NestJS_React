# Backend — NestJS + TypeORM + PostgreSQL

Production-oriented NestJS API starter. Runs as its own service (the React
frontend is a separate app that calls this over HTTP + CORS).

## Stack

- **NestJS 11** (Express platform)
- **TypeORM 0.3** + **PostgreSQL** (`pg`), with **migrations**
- **class-validator / class-transformer** for request validation
- **JWT auth** example module (`@nestjs/jwt` + bcryptjs)
- **Health checks** via `@nestjs/terminus` (`/api/health`, real DB ping)
- **Structured logging** via `nestjs-pino` (pretty in dev, JSON in prod)
- **Jest** unit tests + **supertest** e2e tests
- **Swagger** API docs at `/api/docs`
- Config via `config.json` with environment-variable overrides
- Optional **cron** (`@nestjs/schedule`) and **WebSocket** (`socket.io`) scaffolds

## ORM choice — TypeORM (you can use Sequelize instead)

This template ships with **TypeORM** because it's the TS-first, idiomatic ORM for
NestJS: entities are decorated classes (the model *is* the type), it integrates
with Nest DI via `@InjectRepository`, and it has entity-aware migrations
(`migration:generate`). That's why the example feature uses it.

**It is not mandatory.** If you (the project implementer) prefer Sequelize — e.g.
you already know it from the Fastify template — you can swap it in with the
official **`@nestjs/sequelize`** package. You'd replace `@nestjs/typeorm` +
`typeorm` with `@nestjs/sequelize` + `sequelize`, turn the entities into Sequelize
models, and adjust `database.module.ts` and the example service. The rest of the
template (config, CORS, validation, the `{ ok, data }` contract, scaffolds) is
ORM-agnostic and stays the same. **Prisma** is another valid TS-first option.

## Quick start

```bash
cd Backend
npm install
cp config.example.json config.json   # PowerShell: Copy-Item config.example.json config.json
# edit config.json -> database.connection (host, port, username, password, database)
npm run dev
```

- API base: `http://localhost:3000/api`
- Swagger UI: `http://localhost:3000/api/docs`
- Health (real DB ping): `GET /api/health`

> PowerShell note: if `npm` is blocked by execution policy, use `npm.cmd`.

## Configuration (config.json + env overrides)

`config.json` is the base. Any matching environment variable **overrides** the
file value, so the same build runs locally and in production/containers without
editing the file. `config.json` is gitignored; `config.example.json` is the
committed template.

| config.json path                     | Env override                    | Default            |
| ------------------------------------- | ------------------------------- | ------------------ |
| `app.port`                            | `PORT`                          | `3000`             |
| `cors.origins` (array)                | `CORS_ORIGINS` (comma list)     | `http://localhost:5173` |
| `logging.requests`                    | `LOG_REQUESTS`                  | `true`             |
| `database.enabled`                    | `DATABASE_ENABLED`              | `true`             |
| `database.synchronize`                | `DATABASE_SYNCHRONIZE`          | `false`            |
| `database.logging`                    | `DATABASE_LOGGING`              | `false`            |
| `database.seed.template_items`        | `DATABASE_SEED_TEMPLATE_ITEMS`  | `true`             |
| `database.connection.host`            | `DATABASE_HOST`                 | `127.0.0.1`        |
| `database.connection.port`            | `DATABASE_PORT`                 | `5432`             |
| `database.connection.username`        | `DATABASE_USER`                 | `""`               |
| `database.connection.password`        | `DATABASE_PASSWORD`             | `""`               |
| `database.connection.database`        | `DATABASE_NAME`                 | `""`               |
| `database.connection.schemas.project` | `DATABASE_SCHEMA`               | `public`           |
| `database.connection.schemas.parent`  | `DATABASE_SCHEMA_PARENT`        | `public`           |
| `auth.jwt_secret`                     | `AUTH_JWT_SECRET`               | `change-me-in-production` |
| `auth.jwt_expires_in`                 | `AUTH_JWT_EXPIRES_IN`           | `1h`               |
| `auth.seed_demo_user`                 | `AUTH_SEED_DEMO_USER`           | `true`             |

See `.env.example` for the full list. Every configured non-`public` schema is
created automatically on boot (mirrors the Fastify template's explicit schema step).

### Per-entity schema (`public` vs `project`)

Like the Fastify template's `schemas.parent` / `schemas.project`, you choose a
schema per table. `schemas.project` is the connection-level default, so entities
that say nothing land there. To pin a specific table, set `schema` on its
`@Entity()` using the `SCHEMAS` constant (`src/database/schemas.ts`):

```ts
import { SCHEMAS } from '../schemas';

@Entity({ name: 'template_items', schema: SCHEMAS.project }) // project schema
@Entity({ name: 'log_messages',  schema: SCHEMAS.parent  }) // public/parent schema
```

`SCHEMAS` is resolved from config.json at import time (decorators run before Nest
DI exists), which is why it's a constant rather than read from `ConfigService`.

### Entity keys (uuid + rollingId)

All entities extend `BaseEntity` (`src/database/entities/base.entity.ts`):

- **`uuid`** — the primary key, a random UUID via Postgres' built-in
  `gen_random_uuid()` (no extension needed). Use it as the external identifier;
  routes take `:uuid` (validated with `ParseUUIDPipe`).
- **`rollingId`** — an auto-increment integer kept as a unique secondary index
  (cheap, monotonic, good for ordering/human-friendly references) — **not** the PK.
- **`createdAt` / `updatedAt`** — managed timestamps.

This mirrors the Fastify template's log tables (uuid PK + `rolling_id`).

## Scripts

| Command                      | What it does                                         |
| ---------------------------- | ---------------------------------------------------- |
| `npm run dev`                | Watch-mode dev server (`NODE_ENV=development`)        |
| `npm run build`              | Compile TypeScript to `dist/`                        |
| `npm run start:prod`         | Run the compiled build (`node dist/main.js`)          |
| `npm run seed`               | Reset + reseed the example `template_items` rows      |
| `npm test`                   | Run the Jest unit tests (no DB needed)               |
| `npm run test:cov`           | Unit tests with coverage                             |
| `npm run test:e2e`           | Run supertest e2e tests (needs a running, migrated DB) |
| `npm run migration:generate -- src/database/migrations/Name` | Generate a migration from entity changes |
| `npm run migration:run`      | Apply pending migrations                              |
| `npm run migration:revert`   | Revert the last migration                            |

## Project structure

```text
src/
  main.ts                     bootstrap: CORS, /api prefix, validation, Swagger, filters
  app.module.ts               root module
  config/
    configuration.ts          loads config.json + applies env overrides (typed)
  database/
    database.module.ts        TypeOrmModule.forRootAsync from config
    data-source.ts            standalone DataSource for the TypeORM CLI (migrations)
    typeorm-options.ts        single source of truth for connection options
    ensure-schema.ts          CREATE SCHEMA IF NOT EXISTS before connect
    schemas.ts                SCHEMAS constant for per-entity @Entity({ schema })
    entities/                 base.entity (uuid PK + rollingId), TemplateItem, User
    seeds/                    seed function + standalone reseed script
    migrations/               InitSchema + generated migrations
  modules/
    template-item/            example resource: controller, service, DTOs, seeder, spec
    auth/                     JWT auth example: controller, service, guard, seeder, spec
    health/                   terminus /api/health (DB ping) + /api/template/meta
  common/
    interceptors/             response wrapper ({ ok, data })
    filters/                  error wrapper ({ ok:false, message })
    cron/                     @nestjs/schedule scaffold
    websocket/                socket.io gateway scaffold
test/
  app.e2e-spec.ts             supertest e2e (boots the app; needs a DB)
  jest-e2e.json
```

Request logging is handled by `nestjs-pino` (configured in `app.module.ts`), not
an interceptor.

## API response contract

Every success is wrapped as `{ "ok": true, "data": ... }`; every error as
`{ "ok": false, "statusCode": n, "message": "..." }`. This matches the shared
React frontend (and the Fastify template), so the same UI works against either
backend.

Endpoints:

- `GET    /api/health` — liveness + database connectivity
- `GET    /api/template/meta` — stack metadata for the frontend
- `GET    /api/template-items?status=&limit=` — list example items
- `POST   /api/template-items` — create (validated)
- `POST   /api/template-items/:uuid` — update (partial; this API is GET + POST only)
- `POST   /api/auth/register` — create a user
- `POST   /api/auth/login` — returns `{ accessToken, user }`
- `GET    /api/auth/me` — current user (protected; send `Authorization: Bearer <token>`)

## Authentication (example)

An optional JWT auth module lives in `src/modules/auth/`. It stores users
(`User` entity, bcrypt-hashed passwords), issues JWTs on login, and protects
routes with `JwtAuthGuard` (`@UseGuards(JwtAuthGuard)` + the `@CurrentUser()`
param decorator). A demo user is seeded on boot when `auth.seed_demo_user` is on:

```
username: admin
password: changeme
```

Set a strong `auth.jwt_secret` (or `AUTH_JWT_SECRET`) and turn off
`auth.seed_demo_user` for production. Remove the whole `auth/` module and the
`User` entity if your project doesn't need built-in accounts.

## Migrations & production

`synchronize` defaults to **`false`** — schema changes go through migrations, not
auto-sync. An initial migration (`InitSchema`) that creates the example tables is
included. Typical flows:

- **First-time / CI / production:**
  ```bash
  npm run build
  npm run migration:run     # create/upgrade tables
  npm run start:prod        # node dist/main.js
  ```
- **After changing an entity:** `npm run migration:generate -- src/database/migrations/<Name>`, review it, then `npm run migration:run`.
- **Local dev shortcut:** if you'd rather skip migrations while iterating, set
  `DATABASE_SYNCHRONIZE=true` (or `database.synchronize` in config.json) to
  auto-sync tables from entities. Keep it `false` for any real database.

Other production notes:

- Inject secrets (DB password, `AUTH_JWT_SECRET`) via environment variables, not `config.json`.
- Keep the process alive with pm2, systemd, or your platform's service runner.
- Logging uses `nestjs-pino`: pretty/human-readable when `NODE_ENV` is not
  `production`, raw JSON (ready for log shippers) in production. Request
  auto-logging follows `logging.requests`; auth headers/passwords are redacted.

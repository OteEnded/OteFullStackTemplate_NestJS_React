# Backend — NestJS + TypeORM + PostgreSQL

Production-oriented NestJS API starter. Runs as its own service (the React
frontend is a separate app that calls this over HTTP + CORS).

## Stack

- **NestJS 11** (Express platform)
- **TypeORM 0.3** + **PostgreSQL** (`pg`)
- **class-validator / class-transformer** for request validation
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

## Scripts

| Command                      | What it does                                         |
| ---------------------------- | ---------------------------------------------------- |
| `npm run dev`                | Watch-mode dev server (`NODE_ENV=development`)        |
| `npm run build`              | Compile TypeScript to `dist/`                        |
| `npm run start:prod`         | Run the compiled build (`node dist/main.js`)          |
| `npm run seed`               | Reset + reseed the example `template_items` rows      |
| `npm run migration:generate -- src/database/migrations/Name` | Generate a migration |
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
    entities/                 TemplateItem (example)
    seeds/                    seed function + standalone reseed script
    migrations/               generated migrations
  modules/
    template-item/            example resource: controller, service, DTOs, seeder
    health/                   /api/health (DB ping) + /api/template/meta
  common/
    interceptors/             response wrapper ({ ok, data }) + request logging
    filters/                  error wrapper ({ ok:false, message })
    cron/                     @nestjs/schedule scaffold
    websocket/                socket.io gateway scaffold
```

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
- `PATCH  /api/template-items/:id` — partial update

## Production notes

- Set `DATABASE_SYNCHRONIZE=false` and use **migrations** in production. Auto-sync
  is convenient for local dev but unsafe for real data.
- Inject secrets via environment variables, not `config.json`.
- Build and run the compiled app: `npm run build` then `npm run start:prod`
  (`node dist/main.js`). Keep it alive with a process manager such as pm2,
  systemd, or your platform's service runner.
- For structured production logs, swap Nest's `Logger` for
  [`nestjs-pino`](https://github.com/iamolegga/nestjs-pino).

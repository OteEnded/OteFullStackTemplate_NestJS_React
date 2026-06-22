import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env into process.env once, so env overrides work consistently for the
// Nest runtime, the pre-boot schema step, the TypeORM CLI, and the seed script.
// dotenv does not override variables already present in the real environment.
dotenv.config();

/**
 * Typed shape of the application configuration.
 *
 * The config is loaded from `config.json` at the Backend root and then any
 * matching environment variables override the file values. This is the same
 * "file is the base, env wins" idea used in the Fastify template
 * (`process.env.PORT || config.app.port`), made type-safe for Nest.
 */
export interface DbConnectionConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  /** Postgres schema the project tables live in (mirrors Sequelize schemas.project). */
  schema: string;
}

export interface AppConfiguration {
  app: {
    port: number;
  };
  cors: {
    /** Allowed origins for the separately-hosted frontend. Use ['*'] to allow all. */
    origins: string[];
  };
  logging: {
    /** Log every incoming request via the LoggingInterceptor. */
    requests: boolean;
  };
  database: {
    enabled: boolean;
    /** Dev convenience: auto-create/update tables from entities. Turn OFF in production and use migrations. */
    synchronize: boolean;
    /** Log SQL emitted by TypeORM. */
    logging: boolean;
    seed: {
      /** Seed the example TemplateItems rows on boot when the table is empty. */
      template_items: boolean;
    };
    connection: DbConnectionConfig;
  };
}

const CONFIG_FILE = 'config.json';
const EXAMPLE_FILE = 'config.example.json';

function readConfigFile(): Record<string, any> {
  const root = process.cwd();
  const configPath = path.resolve(root, CONFIG_FILE);
  const examplePath = path.resolve(root, EXAMPLE_FILE);

  let chosen: string | null = null;
  if (fs.existsSync(configPath)) {
    chosen = configPath;
  } else if (fs.existsSync(examplePath)) {
    chosen = examplePath;
  }

  if (!chosen) {
    throw new Error(
      `${CONFIG_FILE} not found. Copy ${EXAMPLE_FILE} to ${CONFIG_FILE} in the Backend root.`,
    );
  }

  try {
    return JSON.parse(fs.readFileSync(chosen, 'utf-8'));
  } catch {
    throw new Error(`Invalid JSON in ${path.basename(chosen)}`);
  }
}

function envBool(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  return value.toLowerCase() === 'true' || value === '1';
}

function envInt(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function firstDefined<T>(...values: (T | undefined)[]): T | undefined {
  for (const value of values) {
    if (value !== undefined) return value;
  }
  return undefined;
}

/**
 * Build the fully-resolved configuration: config.json values with environment
 * variable overrides applied on top. Used by both the Nest ConfigModule and the
 * standalone TypeORM DataSource (which has no access to Nest DI).
 */
export function loadAppConfig(): AppConfiguration {
  const file = readConfigFile();
  const env = process.env;

  const fileConn = file.database?.connection ?? {};

  return {
    app: {
      port: firstDefined(envInt(env.PORT), file.app?.port, 3000) as number,
    },
    cors: {
      origins: env.CORS_ORIGINS
        ? env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
        : (file.cors?.origins ?? ['http://localhost:5173']),
    },
    logging: {
      requests: firstDefined(envBool(env.LOG_REQUESTS), file.logging?.requests, true) as boolean,
    },
    database: {
      enabled: firstDefined(envBool(env.DATABASE_ENABLED), file.database?.enabled, true) as boolean,
      synchronize: firstDefined(
        envBool(env.DATABASE_SYNCHRONIZE),
        file.database?.synchronize,
        false,
      ) as boolean,
      logging: firstDefined(envBool(env.DATABASE_LOGGING), file.database?.logging, false) as boolean,
      seed: {
        template_items: firstDefined(
          envBool(env.DATABASE_SEED_TEMPLATE_ITEMS),
          file.database?.seed?.template_items,
          true,
        ) as boolean,
      },
      connection: {
        host: firstDefined(env.DATABASE_HOST, fileConn.host, '127.0.0.1') as string,
        port: firstDefined(envInt(env.DATABASE_PORT), fileConn.port, 5432) as number,
        username: firstDefined(env.DATABASE_USER, fileConn.username, '') as string,
        password: firstDefined(env.DATABASE_PASSWORD, fileConn.password, '') as string,
        database: firstDefined(env.DATABASE_NAME, fileConn.database, '') as string,
        schema: firstDefined(env.DATABASE_SCHEMA, fileConn.schema, 'public') as string,
      },
    },
  };
}

/**
 * Factory consumed by `ConfigModule.forRoot({ load: [configuration] })`.
 * Exposes the resolved config under the `app`, `cors`, `logging`, `database` keys.
 */
export default function configuration(): AppConfiguration {
  return loadAppConfig();
}

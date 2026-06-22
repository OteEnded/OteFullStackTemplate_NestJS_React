import { Client } from 'pg';
import { AppConfiguration } from '../config/configuration';

/**
 * Ensure the configured Postgres schema exists before TypeORM connects.
 *
 * TypeORM's synchronize will create tables, but a non-`public` schema must
 * already exist. This mirrors the Fastify template's explicit
 * `sequelize.createSchema(...)` step and is safe to run every boot.
 */
export async function ensureSchema(config: AppConfiguration): Promise<void> {
  const c = config.database.connection;

  if (!c.schema || c.schema === 'public') {
    return;
  }

  const client = new Client({
    host: c.host,
    port: c.port,
    user: c.username,
    password: c.password,
    database: c.database,
  });

  await client.connect();
  try {
    // Schema identifier is from local config, not user input; quote it defensively anyway.
    const safeSchema = c.schema.replace(/"/g, '');
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${safeSchema}"`);
  } finally {
    await client.end();
  }
}

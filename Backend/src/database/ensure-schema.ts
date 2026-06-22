import { Client } from 'pg';
import { AppConfiguration } from '../config/configuration';

/**
 * Ensure every configured Postgres schema exists before TypeORM connects.
 *
 * TypeORM's synchronize creates tables, but a non-`public` schema must already
 * exist. This mirrors the Fastify template's explicit `sequelize.createSchema(...)`
 * step and is safe to run every boot. It creates each distinct, non-`public`
 * schema referenced in `database.connection.schemas` (parent + project), so
 * per-entity `@Entity({ schema })` choices all have a home.
 */
export async function ensureSchema(config: AppConfiguration): Promise<void> {
  const c = config.database.connection;

  const schemasToCreate = [...new Set([c.schemas.parent, c.schemas.project])]
    .filter((s) => s && s !== 'public');

  if (schemasToCreate.length === 0) {
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
    for (const schema of schemasToCreate) {
      // Schema identifiers come from local config, not user input; quote defensively anyway.
      const safeSchema = schema.replace(/"/g, '');
      await client.query(`CREATE SCHEMA IF NOT EXISTS "${safeSchema}"`);
    }
  } finally {
    await client.end();
  }
}

import * as path from 'path';
import { DataSourceOptions } from 'typeorm';
import { AppConfiguration } from '../config/configuration';
import { TemplateItem } from './entities/template-item.entity';

/**
 * Single source of truth for TypeORM connection options.
 *
 * Used by both the Nest TypeOrmModule (runtime) and the standalone DataSource
 * in data-source.ts (TypeORM CLI for migrations), so they can never drift apart.
 */
export function buildDataSourceOptions(config: AppConfiguration): DataSourceOptions {
  const c = config.database.connection;

  return {
    type: 'postgres',
    host: c.host,
    port: c.port,
    username: c.username,
    password: c.password,
    database: c.database,
    schema: c.schema,
    entities: [TemplateItem],
    // Resolves both .ts (ts-node CLI) and .js (compiled dist) migration files.
    migrations: [path.join(__dirname, 'migrations', '*.{ts,js}')],
    synchronize: config.database.synchronize,
    logging: config.database.logging,
  };
}

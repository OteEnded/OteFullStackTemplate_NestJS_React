import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { loadAppConfig } from '../config/configuration';
import { buildDataSourceOptions } from './typeorm-options';

/**
 * Standalone DataSource for the TypeORM CLI (migrations).
 *
 * Used by the `typeorm`, `migration:generate`, `migration:run`, and
 * `migration:revert` npm scripts. It reads the same config.json + env overrides
 * as the running app via loadAppConfig().
 */
const dataSource = new DataSource(buildDataSourceOptions(loadAppConfig()));

export default dataSource;

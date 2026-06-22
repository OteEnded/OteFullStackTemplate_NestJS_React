import { loadAppConfig } from '../config/configuration';

/**
 * Per-entity schema names, resolved from config.json (+ env overrides) at import
 * time so they can be used inside `@Entity({ schema })` decorators — which run
 * before Nest's DI/ConfigService is available.
 *
 * This is the TypeORM equivalent of the Fastify template's `schemas` object that
 * each Sequelize model referenced (`schema: schemas.project`). Use it like:
 *
 *   @Entity({ name: 'template_items', schema: SCHEMAS.project })   // project schema
 *   @Entity({ name: 'log_messages',  schema: SCHEMAS.parent  })   // public/parent schema
 *
 * Entities that omit `schema` fall back to the connection-level default, which
 * is also SCHEMAS.project (see typeorm-options.ts).
 */
export const SCHEMAS = loadAppConfig().database.connection.schemas;

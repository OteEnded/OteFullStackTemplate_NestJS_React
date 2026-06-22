import 'reflect-metadata';
import { loadAppConfig } from '../../config/configuration';
import { ensureSchema } from '../ensure-schema';
import { TemplateItem } from '../entities/template-item.entity';
import dataSource from '../data-source';
import { seedTemplateItems } from './seed-template-items';

/**
 * Standalone reset + reseed script: `npm run seed`.
 *
 * Ensures the schema exists, syncs the schema from entities, then force-seeds
 * the example rows (updating existing, removing out-of-seed rows). Useful for
 * resetting local example data without booting the full app.
 */
async function main() {
  const config = loadAppConfig();

  await ensureSchema(config);
  await dataSource.initialize();

  try {
    // Make sure the example table exists even if synchronize is off in config.
    await dataSource.synchronize();

    const repo = dataSource.getRepository(TemplateItem);
    const summary = await seedTemplateItems(repo, { forceSync: true });
    console.log(summary);
    console.log('DB reseed completed with example template items.');
  } finally {
    await dataSource.destroy();
  }
}

main().catch((err) => {
  console.error('Failed to reseed DB:', err);
  process.exit(1);
});

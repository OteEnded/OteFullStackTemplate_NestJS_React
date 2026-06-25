import { Repository } from 'typeorm';
import { TemplateItem } from '../entities/template-item.entity';

export const TEMPLATE_ITEM_SEED: Array<Partial<TemplateItem>> = [
  {
    name: 'Replace sample branding',
    summary: 'Update app copy, colors, and metadata to match your new project.',
    status: 'active',
    priority: 'high',
  },
  {
    name: 'Define your first entity',
    summary: 'Use this sample table as a reference when adding your real domain models.',
    status: 'draft',
    priority: 'medium',
  },
  {
    name: 'Connect production auth',
    summary: 'If the project needs auth, add it as a focused Nest module and guard.',
    status: 'archived',
    priority: 'low',
  },
];

/**
 * Idempotently ensure the example rows exist.
 *
 * - Default: insert any seed row that is missing (by name).
 * - forceSync: also update existing seed rows and delete rows that are not in
 *   the seed set (used by the `npm run seed` reset flow).
 *
 * Returns a short human-readable summary of what happened.
 */
export async function seedTemplateItems(
  repo: Repository<TemplateItem>,
  options: { forceSync?: boolean } = {},
): Promise<string> {
  const forceSync = options.forceSync === true;
  const keepNames = TEMPLATE_ITEM_SEED.map((item) => item.name as string);

  let removed = 0;
  if (forceSync) {
    const all = await repo.find();
    const toRemove = all.filter((row) => !keepNames.includes(row.name));
    if (toRemove.length > 0) {
      await repo.remove(toRemove);
      removed = toRemove.length;
    }
  }

  let created = 0;
  let updated = 0;
  for (const item of TEMPLATE_ITEM_SEED) {
    const existing = await repo.findOne({ where: { name: item.name } });
    if (existing) {
      if (forceSync) {
        await repo.update(existing.uuid, item);
        updated += 1;
      }
    } else {
      await repo.save(repo.create(item));
      created += 1;
    }
  }

  return `seed_template_items: created=${created} updated=${updated} removed=${removed}`;
}

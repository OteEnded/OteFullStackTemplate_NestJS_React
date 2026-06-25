import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';
import { SCHEMAS } from '../schemas';

export const TEMPLATE_ITEM_STATUSES = ['draft', 'active', 'archived'] as const;
export const TEMPLATE_ITEM_PRIORITIES = ['low', 'medium', 'high'] as const;

export type TemplateItemStatus = (typeof TEMPLATE_ITEM_STATUSES)[number];
export type TemplateItemPriority = (typeof TEMPLATE_ITEM_PRIORITIES)[number];

/**
 * Example domain entity. Replace this with your real models when you start a
 * project. Inherits `uuid` (PK), `rollingId`, `createdAt`, `updatedAt` from
 * BaseEntity.
 *
 * Schema selection (mirrors the Fastify template's per-model `schema`):
 * `schema: SCHEMAS.project` pins this table to the project schema. Switch to
 * `SCHEMAS.parent` to put a table in the public/parent schema, or omit `schema`
 * to inherit the connection-level default (which is also SCHEMAS.project).
 */
@Entity({ name: 'template_items', schema: SCHEMAS.project })
export class TemplateItem extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', default: '' })
  summary!: string;

  @Column({ type: 'varchar', length: 32, default: 'draft' })
  status!: TemplateItemStatus;

  @Column({ type: 'varchar', length: 32, default: 'medium' })
  priority!: TemplateItemPriority;
}

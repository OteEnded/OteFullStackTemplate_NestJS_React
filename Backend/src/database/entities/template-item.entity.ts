import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SCHEMAS } from '../schemas';

export const TEMPLATE_ITEM_STATUSES = ['draft', 'active', 'archived'] as const;
export const TEMPLATE_ITEM_PRIORITIES = ['low', 'medium', 'high'] as const;

export type TemplateItemStatus = (typeof TEMPLATE_ITEM_STATUSES)[number];
export type TemplateItemPriority = (typeof TEMPLATE_ITEM_PRIORITIES)[number];

/**
 * Example domain entity. Mirrors the `template_items` table from the Fastify
 * template so the same React frontend works against either backend.
 *
 * Replace this with your real models when you start a project.
 *
 * Schema selection (mirrors the Fastify template's per-model `schema`):
 * `schema: SCHEMAS.project` pins this table to the project schema. Switch to
 * `SCHEMAS.parent` to put a table in the public/parent schema, or omit `schema`
 * to inherit the connection-level default (which is also SCHEMAS.project).
 */
@Entity({ name: 'template_items', schema: SCHEMAS.project })
export class TemplateItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', default: '' })
  summary!: string;

  @Column({ type: 'varchar', length: 32, default: 'draft' })
  status!: TemplateItemStatus;

  @Column({ type: 'varchar', length: 32, default: 'medium' })
  priority!: TemplateItemPriority;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

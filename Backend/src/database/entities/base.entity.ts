import {
  Column,
  CreateDateColumn,
  Generated,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Shared base for all entities (mirrors the Fastify template's log tables):
 *
 * - `uuid`        — the PRIMARY KEY. A random UUID (gen_random_uuid(), built into
 *                   Postgres 13+, so no extension is required). Use this as the
 *                   external/foreign identifier.
 * - `rollingId`   — an auto-incrementing integer, kept as a unique secondary key.
 *                   Cheap, monotonic, and a good index for ordering/pagination and
 *                   human-friendly references — but NOT the primary key.
 * - `createdAt` / `updatedAt` — managed timestamps.
 *
 * Extend this in concrete entities and add your own columns.
 */
export abstract class BaseEntity {
  @PrimaryColumn({ type: 'uuid', default: () => 'gen_random_uuid()' })
  uuid!: string;

  @Index({ unique: true })
  @Column({ type: 'int' })
  @Generated('increment')
  rollingId!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

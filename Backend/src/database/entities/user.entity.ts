import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { SCHEMAS } from '../schemas';

/**
 * Auth example entity. Stores a username and a bcrypt password hash.
 * Inherits `uuid` (PK), `rollingId`, `createdAt`, `updatedAt` from BaseEntity.
 *
 * Part of the optional auth example — remove with the rest of the auth module
 * if your project doesn't need built-in user accounts.
 */
@Entity({ name: 'users', schema: SCHEMAS.project })
export class User extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  username!: string;

  /** bcrypt hash — never the plaintext password. Excluded from API responses. */
  @Column({ type: 'varchar', length: 255, select: false })
  passwordHash!: string;
}

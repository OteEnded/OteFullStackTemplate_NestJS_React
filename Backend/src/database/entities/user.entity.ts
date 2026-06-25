import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SCHEMAS } from '../schemas';

/**
 * Auth example entity. Stores a username and a bcrypt password hash.
 * Lives in the project schema (same as TemplateItem).
 *
 * Part of the optional auth example — remove with the rest of the auth module
 * if your project doesn't need built-in user accounts.
 */
@Entity({ name: 'users', schema: SCHEMAS.project })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  username!: string;

  /** bcrypt hash — never the plaintext password. Excluded from API responses. */
  @Column({ type: 'varchar', length: 255, select: false })
  passwordHash!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

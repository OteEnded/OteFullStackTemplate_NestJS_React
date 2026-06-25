import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { AppConfiguration } from '../../config/configuration';
import { User } from '../../database/entities/user.entity';

export const DEMO_USERNAME = 'admin';
export const DEMO_PASSWORD = 'changeme';

/**
 * Creates a demo user (admin / changeme) on boot when `auth.seed_demo_user` is
 * enabled, so the login flow works immediately. Idempotent. Turn off (config or
 * AUTH_SEED_DEMO_USER=false) for real databases.
 */
@Injectable()
export class AuthSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(AuthSeeder.name);

  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly configService: ConfigService<AppConfiguration, true>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const database = this.configService.get('database', { infer: true });
    const auth = this.configService.get('auth', { infer: true });
    if (!database.enabled || !auth.seedDemoUser) {
      return;
    }

    try {
      const existing = await this.users.findOne({ where: { username: DEMO_USERNAME } });
      if (existing) {
        return;
      }
      const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
      await this.users.save(this.users.create({ username: DEMO_USERNAME, passwordHash }));
      this.logger.log(`Seeded demo user "${DEMO_USERNAME}" (password: ${DEMO_PASSWORD})`);
    } catch (err) {
      this.logger.error(`Skipped demo user seeding: ${(err as Error).message}`);
    }
  }
}

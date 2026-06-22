import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppConfiguration } from '../../config/configuration';
import { TemplateItem } from '../../database/entities/template-item.entity';
import { seedTemplateItems } from '../../database/seeds/seed-template-items';

/**
 * Ensures the example rows exist on boot when
 * `database.seed.template_items` is enabled. Idempotent and safe to leave on
 * in development; turn it off (config or DATABASE_SEED_TEMPLATE_ITEMS=false)
 * for production databases.
 */
@Injectable()
export class TemplateItemSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(TemplateItemSeeder.name);

  constructor(
    @InjectRepository(TemplateItem)
    private readonly repo: Repository<TemplateItem>,
    private readonly configService: ConfigService<AppConfiguration, true>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const database = this.configService.get('database', { infer: true });
    if (!database.enabled || !database.seed.template_items) {
      return;
    }

    try {
      const summary = await seedTemplateItems(this.repo);
      this.logger.log(summary);
    } catch (err) {
      this.logger.error(
        `Skipped template item seeding: ${(err as Error).message}`,
      );
    }
  }
}

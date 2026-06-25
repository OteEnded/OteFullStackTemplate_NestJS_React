import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { AppConfiguration } from '../../config/configuration';

@Controller()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly configService: ConfigService<AppConfiguration, true>,
  ) {}

  /**
   * GET /api/health — liveness plus a real database connectivity check via
   * @nestjs/terminus. Returns 200 with each indicator's status, or 503 if a
   * check fails. The database ping is skipped when the DB is disabled.
   */
  @Get('health')
  @HealthCheck()
  check() {
    const dbEnabled = this.configService.get('database', { infer: true }).enabled;
    const indicators = dbEnabled
      ? [() => this.db.pingCheck('database', { timeout: 2000 })]
      : [];
    return this.health.check(indicators);
  }

  /**
   * GET /api/template/meta — describes the stack for the frontend overview page.
   */
  @Get('template/meta')
  meta() {
    const database = this.configService.get('database', { infer: true });

    return {
      name: 'FullStack Template',
      frontend: 'React + Vite',
      backend: 'NestJS + TypeORM',
      databaseEnabled: database.enabled,
      notes: [
        'Use this workspace as a starting point for a new full-stack project.',
        'Backend (NestJS) and frontend (React) run as separate apps and talk over HTTP + CORS.',
        'Replace the example TemplateItem module with your own entities, DTOs, and controllers.',
      ],
    };
  }
}

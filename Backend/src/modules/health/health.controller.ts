import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppConfiguration } from '../../config/configuration';

@Controller()
export class HealthController {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly configService: ConfigService<AppConfiguration, true>,
  ) {}

  /**
   * GET /api/health — liveness plus a real database connectivity check.
   */
  @Get('health')
  async health() {
    const dbEnabled = this.configService.get('database', { infer: true }).enabled;

    let database: 'up' | 'down' | 'disabled' = 'disabled';
    if (dbEnabled) {
      try {
        await this.dataSource.query('SELECT 1');
        database = 'up';
      } catch {
        database = 'down';
      }
    }

    return {
      service: 'FullStack Template API (NestJS)',
      status: database === 'down' ? 'degraded' : 'ok',
      database,
      timestamp: new Date().toISOString(),
    };
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

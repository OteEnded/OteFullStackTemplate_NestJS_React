import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  const build = async (dbEnabled: boolean) => {
    const health = { check: jest.fn(async (indicators: Array<() => unknown>) => {
      // run the provided indicators so we can assert the DB ping is wired
      await Promise.all(indicators.map((fn) => fn()));
      return { status: 'ok', info: {}, details: {} };
    }) };
    const db = { pingCheck: jest.fn(async () => ({ database: { status: 'up' } })) };
    const configService = { get: jest.fn(() => ({ enabled: dbEnabled })) };

    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: health },
        { provide: TypeOrmHealthIndicator, useValue: db },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    return { controller: moduleRef.get(HealthController), health, db };
  };

  it('runs the database ping when the DB is enabled', async () => {
    const { controller, health, db } = await build(true);
    const res = await controller.check();
    expect(health.check).toHaveBeenCalled();
    expect(db.pingCheck).toHaveBeenCalledWith('database', { timeout: 2000 });
    expect(res.status).toBe('ok');
  });

  it('skips the database ping when the DB is disabled', async () => {
    const { controller, db } = await build(false);
    await controller.check();
    expect(db.pingCheck).not.toHaveBeenCalled();
  });

  it('meta() describes the NestJS + TypeORM stack', async () => {
    const { controller } = await build(true);
    const res = controller.meta();
    expect(res.backend).toBe('NestJS + TypeORM');
    expect(res.databaseEnabled).toBe(true);
  });
});

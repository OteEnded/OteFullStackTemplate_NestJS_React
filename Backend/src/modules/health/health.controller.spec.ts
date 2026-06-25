import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  const buildController = async (opts: {
    dbEnabled: boolean;
    queryImpl?: () => Promise<unknown>;
  }) => {
    const dataSource = { query: jest.fn(opts.queryImpl ?? (async () => [{ '1': 1 }])) };
    const configService = {
      get: jest.fn(() => ({ enabled: opts.dbEnabled })),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: getDataSourceToken(), useValue: dataSource },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    return {
      controller: moduleRef.get(HealthController),
      dataSource: dataSource as unknown as DataSource,
    };
  };

  it('reports database "up" when the ping succeeds', async () => {
    const { controller } = await buildController({ dbEnabled: true });
    const res = await controller.health();
    expect(res.status).toBe('ok');
    expect(res.database).toBe('up');
  });

  it('reports "degraded"/"down" when the ping fails', async () => {
    const { controller } = await buildController({
      dbEnabled: true,
      queryImpl: async () => {
        throw new Error('no connection');
      },
    });
    const res = await controller.health();
    expect(res.status).toBe('degraded');
    expect(res.database).toBe('down');
  });

  it('reports "disabled" when the database is off', async () => {
    const { controller } = await buildController({ dbEnabled: false });
    const res = await controller.health();
    expect(res.database).toBe('disabled');
  });

  it('meta() describes the NestJS + TypeORM stack', async () => {
    const { controller } = await buildController({ dbEnabled: true });
    const res = controller.meta();
    expect(res.backend).toBe('NestJS + TypeORM');
    expect(res.databaseEnabled).toBe(true);
  });
});

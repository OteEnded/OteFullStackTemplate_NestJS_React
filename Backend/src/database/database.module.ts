import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfiguration } from '../config/configuration';
import { buildDataSourceOptions } from './typeorm-options';

/**
 * Wires TypeORM into Nest using the resolved app configuration.
 *
 * Global so any feature module can inject repositories via
 * `TypeOrmModule.forFeature([...])` without re-importing this module.
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfiguration, true>) => {
        // The whole resolved config object is registered under no namespace,
        // so we rebuild it from the typed pieces the ConfigService exposes.
        const config: AppConfiguration = {
          app: configService.get('app', { infer: true }),
          cors: configService.get('cors', { infer: true }),
          logging: configService.get('logging', { infer: true }),
          database: configService.get('database', { infer: true }),
          auth: configService.get('auth', { infer: true }),
        };
        return buildDataSourceOptions(config);
      },
    }),
  ],
})
export class DatabaseModule {}

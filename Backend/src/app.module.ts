import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import configuration, { AppConfiguration } from './config/configuration';
import { CronModule } from './common/cron/cron.module';
import { WebsocketModule } from './common/websocket/websocket.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { TemplateItemModule } from './modules/template-item/template-item.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      // configuration() loads config.json and applies .env overrides itself
      // (via dotenv), so ConfigModule does not also manage env files.
      ignoreEnvFile: true,
      load: [configuration],
    }),
    // Structured logging via pino. Pretty, human-readable in dev; raw JSON in
    // production. pino-http auto-logs each request when logging.requests is on.
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfiguration, true>) => {
        const logging = configService.get('logging', { infer: true });
        const isProd = process.env.NODE_ENV === 'production';
        return {
          pinoHttp: {
            level: isProd ? 'info' : 'debug',
            autoLogging: logging.requests,
            transport: isProd
              ? undefined
              : { target: 'pino-pretty', options: { singleLine: true } },
            // Don't log secrets that may appear in auth requests.
            redact: ['req.headers.authorization', 'req.body.password'],
          },
        };
      },
    }),
    DatabaseModule,
    HealthModule,
    TemplateItemModule,
    // Optional auth example (JWT). Remove with the User entity if not needed.
    AuthModule,
    // Optional scaffolds (parity with the Fastify template). Remove if unused.
    CronModule,
    WebsocketModule,
  ],
})
export class AppModule {}

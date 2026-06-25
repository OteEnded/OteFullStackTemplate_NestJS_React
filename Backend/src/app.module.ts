import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
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

import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger as PinoLogger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { AppConfiguration, loadAppConfig } from './config/configuration';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ensureSchema } from './database/ensure-schema';

async function bootstrap() {
  // Mirror the Fastify template's explicit createSchema step: make sure the
  // configured Postgres schema exists before TypeORM tries to sync into it.
  const fileConfig = loadAppConfig();
  if (fileConfig.database.enabled) {
    await ensureSchema(fileConfig);
  }

  // bufferLogs so early logs are flushed through pino once it's ready.
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(PinoLogger));
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService<AppConfiguration, true>);

  const appConfig = configService.get('app', { infer: true });
  const corsConfig = configService.get('cors', { infer: true });

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: corsConfig.origins.includes('*') ? true : corsConfig.origins,
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown properties
      forbidNonWhitelisted: false,
      transform: true, // coerce payloads/query into DTO types
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Request logging is handled by pino-http (see LoggerModule in AppModule).
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  // Interactive API docs at /api/docs (Swagger UI). DTOs are documented
  // automatically by the @nestjs/swagger CLI plugin (see nest-cli.json).
  const swaggerConfig = new DocumentBuilder()
    .setTitle('FullStack Template API')
    .setDescription('NestJS + TypeORM backend for the Nest + React template')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // Graceful shutdown (closes DB connections, stops cron, etc.)
  app.enableShutdownHooks();

  const port = process.env.PORT ? Number(process.env.PORT) : appConfig.port;
  await app.listen(port, '0.0.0.0');

  logger.log(`NestJS API listening on http://localhost:${port}/api`);
  logger.log(`Swagger UI available at http://localhost:${port}/api/docs`);
  logger.log(`Allowed CORS origins: ${corsConfig.origins.join(', ')}`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start NestJS server:', err);
  process.exit(1);
});

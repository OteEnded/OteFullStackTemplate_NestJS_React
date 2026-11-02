import { INestApplication } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { createValidationPipe } from './common/validation';

/**
 * The app-wide HTTP contract, applied in ONE place so `main.ts` and the e2e
 * tests cannot drift apart: `/api` prefix, DTO validation, the `{ ok, data }`
 * success envelope and the `{ ok: false, message, code }` error envelope.
 *
 * (CORS, Swagger and listen() stay in main.ts — they are deployment concerns.)
 */
export function configureApp(app: INestApplication): INestApplication {
  app.setGlobalPrefix('api');
  app.useGlobalPipes(createValidationPipe());
  // Request logging is handled by pino-http (see LoggerModule in AppModule).
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  return app;
}

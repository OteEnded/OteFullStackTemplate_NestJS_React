import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppConfiguration } from '../../config/configuration';

/**
 * Logs each request as `METHOD url -> status (ms)` using Nest's Logger.
 *
 * Gated by `logging.requests` in config. This is the lightweight, idiomatic
 * Nest equivalent of the Fastify template's request logger. For production-grade
 * structured logs, swap Nest's Logger for nestjs-pino (see README).
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  private readonly enabled: boolean;

  constructor(configService: ConfigService<AppConfiguration, true>) {
    this.enabled = configService.get('logging', { infer: true }).requests;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (!this.enabled) {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const start = Date.now();
    const { method, originalUrl } = req;

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        this.logger.log(`${method} ${originalUrl} -> ${res.statusCode} (${ms}ms)`);
      }),
    );
  }
}

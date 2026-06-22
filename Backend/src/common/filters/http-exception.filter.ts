import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Formats every error as `{ ok: false, message, statusCode }`.
 *
 * Complements TransformInterceptor so the API has one consistent envelope for
 * both success and failure. Validation errors (class-validator) arrive as a
 * BadRequestException whose response carries a `message` array — we flatten it.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (body && typeof body === 'object') {
        const m = (body as Record<string, unknown>).message;
        message = Array.isArray(m) ? m.join(', ') : String(m ?? exception.message);
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(message, (exception as Error)?.stack);
    }

    response.status(statusCode).json({ ok: false, statusCode, message });
  }
}

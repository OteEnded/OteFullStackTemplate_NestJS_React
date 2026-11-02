import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';

/**
 * ONE error shape for the whole API: `{ ok: false, message, code }`.
 *   + `details`    on validation errors (field-level messages, see common/validation.ts)
 *   + `request_id` on server errors (links the client's report to the log line)
 *
 * ⭐ Ote, 2026-11-01: "for api use res shape {ok:true,data} / {ok:false, message, code}".
 * `code` is a stable, machine-readable string the frontend can branch on;
 * `message` is for humans. Same contract as the Fastify template v2
 * (Backend/app/plugins/error-handler.js there).
 *
 * How `code` is chosen:
 *   1. The exception's response object carries a string `code` -> use it.
 *      Throw `new HttpException({ message, code: 'quota_exceeded' }, 429)` (or
 *      `new ConflictException({ message, code: 'username_taken' })`) to expose your own.
 *   2. Otherwise by HTTP status (STATUS_CODES below), e.g. 401 -> not_signed_in.
 *   3. 5xx: a generic message + `internal_error` + `request_id`; the real
 *      error (stack, SQL, ...) goes to the log only — never to the client.
 *      A 5xx HttpException that carries its own `code` was written to be
 *      client-safe and keeps its message and code (e.g. health's `db_down`).
 */
const STATUS_CODES: Record<number, string> = {
  400: 'invalid_request', // includes malformed JSON bodies (Nest raises a 400 for those)
  401: 'not_signed_in',
  403: 'forbidden',
  404: 'not_found',
  405: 'method_not_allowed',
  409: 'conflict',
  413: 'payload_too_large',
  415: 'unsupported_media_type',
  422: 'unprocessable',
  429: 'too_many_requests',
};

export interface ApiErrorBody {
  ok: false;
  message: string;
  code: string;
  details?: unknown;
  data?: unknown;
  request_id?: string;
}

type ExceptionResponse = {
  message?: unknown;
  code?: unknown;
  details?: unknown;
  data?: unknown;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { id?: string | number }>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const raw: ExceptionResponse | string | undefined =
      exception instanceof HttpException
        ? (exception.getResponse() as ExceptionResponse | string)
        : undefined;
    const fields: ExceptionResponse = typeof raw === 'object' && raw !== null ? raw : {};
    const ownCode = typeof fields.code === 'string' && fields.code ? fields.code : undefined;

    let body: ApiErrorBody;

    if (status < HttpStatus.INTERNAL_SERVER_ERROR) {
      body = {
        ok: false,
        message: this.messageOf(raw, exception),
        code: ownCode ?? STATUS_CODES[status] ?? 'bad_request',
      };
      if (fields.details !== undefined) body.details = fields.details;
      if (fields.data !== undefined) body.data = fields.data;
    } else {
      // Server errors: full detail to the log, a generic message to the client.
      // pino-http assigns req.id (and logs it with the request line); fall back
      // to a fresh uuid when the app runs without it (e.g. unit tests).
      const requestId = String(request?.id ?? randomUUID());
      const detail = exception instanceof Error ? exception.stack ?? exception.message : String(exception);
      this.logger.error(
        `[${requestId}] ${request?.method} ${request?.url?.split('?')[0]} -> ${status}: ${detail}`,
      );
      body = ownCode
        ? { ok: false, message: this.messageOf(raw, exception), code: ownCode, request_id: requestId }
        : { ok: false, message: 'Internal server error', code: 'internal_error', request_id: requestId };
      if (ownCode && fields.data !== undefined) body.data = fields.data;
    }

    response.status(status).json(body);
  }

  private messageOf(raw: ExceptionResponse | string | undefined, exception: unknown): string {
    if (typeof raw === 'string') return raw;
    const m = raw?.message;
    if (Array.isArray(m)) return m.join(', ');
    if (typeof m === 'string' && m) return m;
    return exception instanceof Error ? exception.message : 'Request failed';
  }
}

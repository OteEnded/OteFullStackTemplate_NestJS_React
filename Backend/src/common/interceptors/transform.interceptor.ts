import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  ok: true;
  data: T;
}

/**
 * Wraps every successful controller return value as `{ ok: true, data }`.
 *
 * This matches the response contract used by the Fastify template and the
 * shared React frontend (which reads `result.ok` and `result.data`). Errors are
 * shaped separately by HttpExceptionFilter.
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(map((data) => ({ ok: true as const, data })));
  }
}

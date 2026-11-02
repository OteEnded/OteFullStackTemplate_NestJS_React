import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';

export interface FieldError {
  /** Dotted path of the offending property, e.g. `name` or `address.city`. */
  field: string;
  message: string;
}

/** Flatten class-validator's nested ValidationError tree into field messages. */
export function flattenValidationErrors(errors: ValidationError[], parent = ''): FieldError[] {
  const out: FieldError[] = [];
  for (const error of errors) {
    const field = parent ? `${parent}.${error.property}` : error.property;
    for (const message of Object.values(error.constraints ?? {})) {
      out.push({ field, message });
    }
    if (error.children?.length) {
      out.push(...flattenValidationErrors(error.children, field));
    }
  }
  return out;
}

/**
 * The global DTO validation pipe (class-validator + class-transformer).
 *
 * A failed validation becomes
 *   400 { ok: false, message, code: 'invalid_request', details: [{ field, message }] }
 * (the envelope itself is written by HttpExceptionFilter).
 */
export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true, // strip unknown properties
    forbidNonWhitelisted: false,
    transform: true, // coerce payloads/query into DTO types
    transformOptions: { enableImplicitConversion: true },
    exceptionFactory: (errors) => {
      const details = flattenValidationErrors(errors);
      return new BadRequestException({
        message: details.map((d) => d.message).join(', ') || 'Invalid request',
        code: 'invalid_request',
        details,
      });
    },
  });
}

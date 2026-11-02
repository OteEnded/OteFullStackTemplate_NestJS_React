import { ValidationPipe } from '@nestjs/common';

/** The global DTO validation pipe (class-validator + class-transformer). */
export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true, // strip unknown properties
    forbidNonWhitelisted: false,
    transform: true, // coerce payloads/query into DTO types
    transformOptions: { enableImplicitConversion: true },
  });
}

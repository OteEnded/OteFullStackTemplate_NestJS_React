import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from './auth.service';

/**
 * Lightweight JWT guard (no Passport dependency).
 *
 * Reads a `Bearer <token>` Authorization header, verifies it with JwtService,
 * and attaches the decoded payload to `request.user`. Apply with
 * `@UseGuards(JwtAuthGuard)` on a controller or route.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('missing bearer token');
    }

    try {
      request.user = await this.jwt.verifyAsync<JwtPayload>(token);
      return true;
    } catch {
      throw new UnauthorizedException('invalid or expired token');
    }
  }

  private extractToken(request: Request): string | null {
    const header = request.headers.authorization;
    if (!header) return null;
    const [scheme, value] = header.split(' ');
    return scheme === 'Bearer' && value ? value : null;
  }
}

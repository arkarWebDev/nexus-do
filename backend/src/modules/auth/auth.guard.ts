import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDb } from '../../common/database/database.provider';
import { users } from '../../common/database/schema';

const KEY_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.apiKey, token))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const keyAge = Date.now() - user.keyIssuedAt.getTime();
    if (keyAge > KEY_MAX_AGE_MS) {
      throw new UnauthorizedException(
        'API key has expired. Please generate a new key from Settings.',
      );
    }

    request['user'] = user;
    return true;
  }

  private extractToken(request: Request): string | null {
    const cookieToken = request.cookies?.['nexusdo_session'];
    if (cookieToken) return cookieToken;

    const authHeader = request.headers.authorization;
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) return null;

    return token;
  }
}

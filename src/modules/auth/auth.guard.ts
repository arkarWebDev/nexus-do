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

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException(
        'Invalid Authorization format. Expected: Bearer <API_KEY>',
      );
    }

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.apiKey, token))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Invalid API Key');
    }

    request['user'] = user;
    return true;
  }
}

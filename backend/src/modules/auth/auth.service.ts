import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDb } from '../../common/database/database.provider';
import { users } from '../../common/database/schema';

@Injectable()
export class AuthService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async login(apiKey: string, res: Response) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.apiKey, apiKey))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Invalid API key');
    }

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('nexusdo_session', apiKey, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
      maxAge: 90 * 24 * 60 * 60 * 1000,
    });

    return { ok: true };
  }

  logout(res: Response) {
    res.clearCookie('nexusdo_session', { path: '/' });
    return { ok: true };
  }
}

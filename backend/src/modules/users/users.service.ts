import { Injectable, Inject } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDb } from '../../common/database/database.provider';
import { users } from '../../common/database/schema';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async register() {
    let apiKey: string;
    let existing: unknown;

    do {
      apiKey = randomBytes(32).toString('hex');
      [existing] = await this.db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.apiKey, apiKey))
        .limit(1);
    } while (existing);

    const [user] = await this.db
      .insert(users)
      .values({ apiKey })
      .returning({ id: users.id, apiKey: users.apiKey });

    return user;
  }
}

import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDb } from '../../common/database/database.provider';
import { users } from '../../common/database/schema';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async register() {
    const apiKey = await this.generateUniqueKey();

    const [user] = await this.db
      .insert(users)
      .values({ apiKey, keyIssuedAt: new Date() })
      .returning({ id: users.id, apiKey: users.apiKey });

    return user;
  }

  private async generateUniqueKey(): Promise<string> {
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

    return apiKey;
  }

  async rotateKey(userId: number) {
    const apiKey = await this.generateUniqueKey();

    const [user] = await this.db
      .update(users)
      .set({ apiKey, keyIssuedAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning({ id: users.id, apiKey: users.apiKey });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findById(id: number) {
    const [user] = await this.db
      .select({
        id: users.id,
        apiKey: users.apiKey,
        telegramChatId: users.telegramChatId,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}

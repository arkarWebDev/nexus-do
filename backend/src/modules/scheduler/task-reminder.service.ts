import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectBot } from 'nestjs-telegraf';
import type { Telegraf } from 'telegraf';
import { eq, and, lte } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDb } from '../../common/database/database.provider';
import { tasks, users } from '../../common/database/schema';

function nextOccurrence(from: Date, recurrence: string): Date {
  const d = new Date(from);
  switch (recurrence) {
    case 'daily':
      d.setDate(d.getDate() + 1);
      break;
    case 'weekly':
      d.setDate(d.getDate() + 7);
      break;
    case 'weekdays': {
      const day = d.getDay();
      const add = day === 5 ? 3 : day === 6 ? 2 : 1;
      d.setDate(d.getDate() + add);
      break;
    }
  }
  return d;
}

@Injectable()
export class TaskReminderService {
  private readonly logger = new Logger(TaskReminderService.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    @InjectBot() private readonly bot: Telegraf,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async sendReminders() {
    const now = new Date();

    const due = await this.db
      .select({
        id: tasks.id,
        userId: tasks.userId,
        action: tasks.action,
        remindAt: tasks.remindAt,
        recurrence: tasks.recurrence,
      })
      .from(tasks)
      .where(
        and(
          eq(tasks.isCompleted, false),
          lte(tasks.remindAt, now),
        ),
      );

    if (due.length === 0) return;

    this.logger.log(`Found ${due.length} task(s) to remind`);

    for (const task of due) {
      try {
        const [user] = await this.db
          .select({ telegramChatId: users.telegramChatId })
          .from(users)
          .where(eq(users.id, task.userId))
          .limit(1);

        if (user?.telegramChatId) {
          const prefix = task.recurrence ? '🔁 ' : '🔔 ';
          await this.bot.telegram.sendMessage(
            user.telegramChatId,
            `${prefix}**Task Reminder**\n\n${task.action}`,
            { parse_mode: 'Markdown' },
          );
        }

        if (task.recurrence) {
          const next = nextOccurrence(task.remindAt, task.recurrence);
          await this.db
            .update(tasks)
            .set({ remindAt: next, updatedAt: new Date() })
            .where(eq(tasks.id, task.id));
        } else {
          await this.db
            .update(tasks)
            .set({ isCompleted: true, updatedAt: new Date() })
            .where(eq(tasks.id, task.id));
        }
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        this.logger.warn(`Failed to send reminder for task #${task.id}: ${msg}`);
      }
    }
  }
}

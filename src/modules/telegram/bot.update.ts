import { Inject } from '@nestjs/common';
import { Update, Ctx, Start, Command } from 'nestjs-telegraf';
import type { Context } from 'telegraf';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDb } from '../../common/database/database.provider';
import { users, tasks, todos } from '../../common/database/schema';

@Update()
export class BotUpdate {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  private async authenticatedUserId(chatId: number): Promise<number | null> {
    const [user] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.telegramChatId, String(chatId)))
      .limit(1);
    return user?.id ?? null;
  }

  private requireAuth(ctx: Context): number | null {
    if (!ctx.chat) return null;
    return ctx.chat.id;
  }

  @Start()
  async onStart(@Ctx() ctx: Context) {
    if (!ctx.chat) return;

    const text = (ctx.message as { text?: string })?.text ?? '';
    const parts = text.trim().split(/\s+/);

    if (parts.length < 2) {
      await ctx.reply(
        'Welcome to NexusDo! Please link your account by providing your API key:\n\n/start <API_KEY>',
      );
      return;
    }

    const apiKey = parts[1];

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.apiKey, apiKey))
      .limit(1);

    if (!user) {
      await ctx.reply(
        'Invalid API key. Please check your key and try again:\n\n/start <API_KEY>',
      );
      return;
    }

    await this.db
      .update(users)
      .set({
        telegramChatId: String(ctx.chat.id),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    await ctx.reply(
      'Your Telegram account has been successfully linked! You can now use:\n\n' +
        '/addtask <YYYY-MM-DD HH:mm> <action>\n' +
        '/tasks — list pending tasks\n' +
        '/donetask <id>\n\n' +
        '/addtodo <category> <action>\n' +
        '/todos — list pending todos\n' +
        '/donetodo <id>',
    );
  }

  @Command('addtask')
  async onAddTask(@Ctx() ctx: Context) {
    const chatId = this.requireAuth(ctx);
    if (!chatId) return;

    const userId = await this.authenticatedUserId(chatId);
    if (!userId) {
      await ctx.reply('Please link your account first: /start <API_KEY>');
      return;
    }

    const text = (ctx.message as { text?: string })?.text ?? '';
    const args = text.replace(/^\/\S+(@\S+)?\s*/, '').trim();

    if (!args) {
      await ctx.reply(
        'Usage: /addtask <YYYY-MM-DD HH:mm> <action>\nExample: /addtask 2026-08-01 14:30 Buy groceries',
      );
      return;
    }

    const match = args.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\s+(.+)$/s);

    if (!match) {
      await ctx.reply(
        'Invalid format.\nUsage: /addtask <YYYY-MM-DD HH:mm> <action>\nExample: /addtask 2026-08-01 14:30 Buy groceries',
      );
      return;
    }

    const dateStr = `${match[1]}T${match[2]}:00`;
    const remindAt = new Date(dateStr);

    if (isNaN(remindAt.getTime())) {
      await ctx.reply(
        'Invalid date/time. Please ensure YYYY-MM-DD and HH:mm are valid.',
      );
      return;
    }

    const action = match[3];

    await this.db.insert(tasks).values({ userId, action, remindAt });

    await ctx.reply(
      `Task created: "${action}"\nReminder set for ${match[1]} at ${match[2]}`,
    );
  }

  @Command('tasks')
  async onTasks(@Ctx() ctx: Context) {
    const chatId = this.requireAuth(ctx);
    if (!chatId) return;

    const userId = await this.authenticatedUserId(chatId);
    if (!userId) {
      await ctx.reply('Please link your account first: /start <API_KEY>');
      return;
    }

    const records = await this.db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.isCompleted, false)))
      .orderBy(tasks.remindAt);

    if (records.length === 0) {
      await ctx.reply('No pending tasks.');
      return;
    }

    const list = records
      .map((t) => {
        const d = t.remindAt.toISOString();
        const date = d.substring(0, 10);
        const time = d.substring(11, 16);
        return `#${t.id}  [${date} ${time}]  ${t.action}`;
      })
      .join('\n');

    await ctx.reply(`Your pending tasks:\n\n${list}`);
  }

  @Command('donetask')
  async onDoneTask(@Ctx() ctx: Context) {
    const chatId = this.requireAuth(ctx);
    if (!chatId) return;

    const userId = await this.authenticatedUserId(chatId);
    if (!userId) {
      await ctx.reply('Please link your account first: /start <API_KEY>');
      return;
    }

    const text = (ctx.message as { text?: string })?.text ?? '';
    const arg = text.replace(/^\/\S+(@\S+)?\s*/, '').trim();
    const id = parseInt(arg, 10);

    if (!arg || isNaN(id)) {
      await ctx.reply('Usage: /donetask <id>\nExample: /donetask 3');
      return;
    }

    const [task] = await this.db
      .update(tasks)
      .set({ isCompleted: true, updatedAt: new Date() })
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning({ id: tasks.id, action: tasks.action });

    if (!task) {
      await ctx.reply(`Task #${id} not found or does not belong to you.`);
      return;
    }

    await ctx.reply(`Task #${task.id} marked as completed: "${task.action}"`);
  }

  @Command('addtodo')
  async onAddTodo(@Ctx() ctx: Context) {
    const chatId = this.requireAuth(ctx);
    if (!chatId) return;

    const userId = await this.authenticatedUserId(chatId);
    if (!userId) {
      await ctx.reply('Please link your account first: /start <API_KEY>');
      return;
    }

    const text = (ctx.message as { text?: string })?.text ?? '';
    const args = text.replace(/^\/\S+(@\S+)?\s*/, '').trim();

    if (!args) {
      await ctx.reply(
        'Usage: /addtodo <category> <action>\nExample: /addtodo Work Review quarterly report',
      );
      return;
    }

    const match = args.match(/^(\S+)\s+(.+)$/s);

    if (!match) {
      await ctx.reply(
        'Usage: /addtodo <category> <action>\nExample: /addtodo Work Review quarterly report',
      );
      return;
    }

    const category = match[1];
    const action = match[2];

    await this.db.insert(todos).values({ userId, category, action });

    await ctx.reply(`Todo created: [${category}] "${action}"`);
  }

  @Command('todos')
  async onTodos(@Ctx() ctx: Context) {
    const chatId = this.requireAuth(ctx);
    if (!chatId) return;

    const userId = await this.authenticatedUserId(chatId);
    if (!userId) {
      await ctx.reply('Please link your account first: /start <API_KEY>');
      return;
    }

    const records = await this.db
      .select()
      .from(todos)
      .where(and(eq(todos.userId, userId), eq(todos.isCompleted, false)))
      .orderBy(todos.category, todos.createdAt);

    if (records.length === 0) {
      await ctx.reply('No pending todos.');
      return;
    }

    const list = records
      .map((t) => `#${t.id}  [${t.category}]  ${t.action}`)
      .join('\n');

    await ctx.reply(`Your pending todos:\n\n${list}`);
  }

  @Command('donetodo')
  async onDoneTodo(@Ctx() ctx: Context) {
    const chatId = this.requireAuth(ctx);
    if (!chatId) return;

    const userId = await this.authenticatedUserId(chatId);
    if (!userId) {
      await ctx.reply('Please link your account first: /start <API_KEY>');
      return;
    }

    const text = (ctx.message as { text?: string })?.text ?? '';
    const arg = text.replace(/^\/\S+(@\S+)?\s*/, '').trim();
    const id = parseInt(arg, 10);

    if (!arg || isNaN(id)) {
      await ctx.reply('Usage: /donetodo <id>\nExample: /donetodo 1');
      return;
    }

    const [todo] = await this.db
      .update(todos)
      .set({ isCompleted: true, updatedAt: new Date() })
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .returning({ id: todos.id, action: todos.action, category: todos.category });

    if (!todo) {
      await ctx.reply(`Todo #${id} not found or does not belong to you.`);
      return;
    }

    await ctx.reply(
      `Todo #${todo.id} marked as completed: [${todo.category}] "${todo.action}"`,
    );
  }
}

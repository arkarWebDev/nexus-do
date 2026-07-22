import { Inject } from '@nestjs/common';
import { Update, Ctx, Start, Command, Action } from 'nestjs-telegraf';
import type { Context } from 'telegraf';
import { Markup } from 'telegraf';
import { eq, and } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { DRIZZLE, type DrizzleDb } from '../../common/database/database.provider';
import { users, tasks, todos, type Todo } from '../../common/database/schema';

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

  private buildTodosKeyboard(records: Todo[]) {
    const labels = records.map((t) => {
      const icon = t.isCompleted ? '✅' : '⬜️';
      return `${icon} [${t.category}] ${t.action}`;
    });

    const maxLen = Math.max(...labels.map((l) => [...l].length));

    const buttons = records.map((t, i) => {
      const padded = labels[i].padEnd(
        labels[i].length + (maxLen - [...labels[i]].length),
        ' ',
      );
      return [
        Markup.button.callback(padded, `toggle_todo_${t.id}`),
      ];
    });

    return Markup.inlineKeyboard(buttons);
  }

  @Start()
  async onStart(@Ctx() ctx: Context) {
    if (!ctx.chat) return;

    const text = (ctx.message as { text?: string })?.text ?? '';
    const parts = text.trim().split(/\s+/);

    if (parts.length < 2) {
      await ctx.reply(
        'Welcome to NexusDo! Please link your account by providing your API key:\n\n' +
          '/start <API_KEY>',
      );
      return;
    }

    try {
      await ctx.deleteMessage();
    } catch {
      // ignore if bot cannot delete messages in this chat
    }

    const apiKey = parts[1];

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.apiKey, apiKey))
      .limit(1);

    if (!user) {
      await ctx.reply(
        'Invalid API key. Please check your key and try again:\n\n' +
          '/start <API_KEY>',
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
        '/donetask <id>\n' +
        '/cleantasks — remove completed tasks\n\n' +
        '/addtodo <action> #<category>\n' +
        '/todos — list all todos (tap to toggle)\n' +
        '/donetodo <id>\n' +
        '/cleantodos — remove completed todos\n\n' +
        '/rotatekey — generate a new API key',
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

  @Command('cleantasks')
  async onCleanTasks(@Ctx() ctx: Context) {
    const chatId = this.requireAuth(ctx);
    if (!chatId) return;

    const userId = await this.authenticatedUserId(chatId);
    if (!userId) {
      await ctx.reply('Please link your account first: /start <API_KEY>');
      return;
    }

    const deleted = await this.db
      .delete(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.isCompleted, true)))
      .returning({ id: tasks.id });

    await ctx.reply(`Cleaned up ${deleted.length} completed task(s).`);
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
        'Usage: /addtodo <action> #<category>\nExample: /addtodo Review the PR #Work',
      );
      return;
    }

    const hashtagMatch = args.match(/#(\S+)\s*$/);

    let action: string;
    let category: string;

    if (hashtagMatch) {
      category = hashtagMatch[1];
      action = args.slice(0, hashtagMatch.index).trim();
    } else {
      category = 'General';
      action = args;
    }

    if (!action) {
      await ctx.reply(
        'Usage: /addtodo <action> #<category>\nExample: /addtodo Review the PR #Work',
      );
      return;
    }

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
      .where(eq(todos.userId, userId))
      .orderBy(todos.isCompleted, todos.category, todos.createdAt);

    if (records.length === 0) {
      await ctx.reply('No todos yet. Create one with /addtodo');
      return;
    }

    const keyboard = this.buildTodosKeyboard(records);

    await ctx.reply('Your todos (tap to toggle):', {
      reply_markup: keyboard.reply_markup,
    });
  }

  @Action(/^toggle_todo_(.+)$/)
  async onToggleTodo(@Ctx() ctx: Context) {
    const chatId = this.requireAuth(ctx);
    if (!chatId) return;

    const userId = await this.authenticatedUserId(chatId);
    if (!userId) {
      await ctx.answerCbQuery('Please link your account first.');
      return;
    }

    const callbackData = ctx.callbackQuery && 'data' in ctx.callbackQuery
      ? ctx.callbackQuery.data
      : undefined;
    if (!callbackData) return;
    const todoId = parseInt(callbackData.split('_').pop()!, 10);

    if (isNaN(todoId)) {
      await ctx.answerCbQuery('Invalid todo.');
      return;
    }

    const [todo] = await this.db
      .select()
      .from(todos)
      .where(and(eq(todos.id, todoId), eq(todos.userId, userId)))
      .limit(1);

    if (!todo) {
      await ctx.answerCbQuery('Todo not found.');
      return;
    }

    await this.db
      .update(todos)
      .set({ isCompleted: !todo.isCompleted, updatedAt: new Date() })
      .where(eq(todos.id, todoId));

    await ctx.answerCbQuery(
      todo.isCompleted ? 'Marked as pending ⬜️' : 'Marked as done ✅',
    );

    const records = await this.db
      .select()
      .from(todos)
      .where(eq(todos.userId, userId))
      .orderBy(todos.isCompleted, todos.category, todos.createdAt);

    const keyboard = this.buildTodosKeyboard(records);

    try {
      await ctx.editMessageReplyMarkup(keyboard.reply_markup);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : '';
      if (msg.includes('message is not modified')) {
        return;
      }
    }
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

  @Command('cleantodos')
  async onCleanTodos(@Ctx() ctx: Context) {
    const chatId = this.requireAuth(ctx);
    if (!chatId) return;

    const userId = await this.authenticatedUserId(chatId);
    if (!userId) {
      await ctx.reply('Please link your account first: /start <API_KEY>');
      return;
    }

    const deleted = await this.db
      .delete(todos)
      .where(and(eq(todos.userId, userId), eq(todos.isCompleted, true)))
      .returning({ id: todos.id });

    await ctx.reply(`Cleaned up ${deleted.length} completed todo(s).`);
  }

  @Command('rotatekey')
  async onRotateKey(@Ctx() ctx: Context) {
    const chatId = this.requireAuth(ctx);
    if (!chatId) return;

    const userId = await this.authenticatedUserId(chatId);
    if (!userId) {
      await ctx.reply('Please link your account first: /start <API_KEY>');
      return;
    }

    const apiKey = randomBytes(32).toString('hex');

    await this.db
      .update(users)
      .set({ apiKey, keyIssuedAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, userId));

    await ctx.reply(
      `Your API key has been rotated. Your new key:\n\n\`${apiKey}\`\n\nUse this to log in on the web or share it to link new devices. Save it somewhere safe.`,
      { parse_mode: 'Markdown' },
    );
  }
}

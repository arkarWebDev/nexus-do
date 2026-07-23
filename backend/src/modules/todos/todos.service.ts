import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDb } from '../../common/database/database.provider';
import { todos } from '../../common/database/schema';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { EventsService } from '../../common/events/events.service';

@Injectable()
export class TodosService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly events: EventsService,
  ) {}

  async create(userId: number, dto: CreateTodoDto) {
    const [todo] = await this.db
      .insert(todos)
      .values({
        userId,
        action: dto.action,
        category: dto.category,
      })
      .returning();

    this.events.emit({ type: 'todos', userId });
    return todo;
  }

  async findAll(userId: number) {
    return this.db
      .select()
      .from(todos)
      .where(eq(todos.userId, userId))
      .orderBy(todos.category, todos.createdAt);
  }

  async update(id: number, userId: number, dto: UpdateTodoDto) {
    const [todo] = await this.db
      .update(todos)
      .set({
        ...(dto.action !== undefined ? { action: dto.action } : {}),
        ...(dto.category !== undefined ? { category: dto.category } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .returning();

    if (!todo) throw new NotFoundException('Todo not found');

    this.events.emit({ type: 'todos', userId });
    return todo;
  }

  async markComplete(id: number, userId: number) {
    const [existing] = await this.db
      .select({ isCompleted: todos.isCompleted })
      .from(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Todo not found');
    }

    const [todo] = await this.db
      .update(todos)
      .set({ isCompleted: !existing.isCompleted, updatedAt: new Date() })
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .returning();

    this.events.emit({ type: 'todos', userId });
    return todo;
  }

  async remove(id: number, userId: number) {
    const [todo] = await this.db
      .delete(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .returning();

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    this.events.emit({ type: 'todos', userId });
    return todo;
  }

  async cleanupCompleted(userId: number) {
    const deleted = await this.db
      .delete(todos)
      .where(and(eq(todos.userId, userId), eq(todos.isCompleted, true)))
      .returning();

    this.events.emit({ type: 'todos', userId });
    return { deleted: deleted.length };
  }
}

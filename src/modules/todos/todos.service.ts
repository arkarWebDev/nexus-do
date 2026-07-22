import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDb } from '../../common/database/database.provider';
import { todos } from '../../common/database/schema';
import { CreateTodoDto } from './dto/create-todo.dto';

@Injectable()
export class TodosService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(userId: number, dto: CreateTodoDto) {
    const [todo] = await this.db
      .insert(todos)
      .values({
        userId,
        action: dto.action,
        category: dto.category,
      })
      .returning();

    return todo;
  }

  async findAll(userId: number) {
    return this.db
      .select()
      .from(todos)
      .where(eq(todos.userId, userId))
      .orderBy(todos.category, todos.createdAt);
  }

  async markComplete(id: number, userId: number) {
    const [todo] = await this.db
      .update(todos)
      .set({ isCompleted: true, updatedAt: new Date() })
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .returning();

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

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

    return todo;
  }
}

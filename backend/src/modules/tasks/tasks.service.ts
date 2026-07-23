import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and, ilike } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDb } from '../../common/database/database.provider';
import { tasks } from '../../common/database/schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { EventsService } from '../../common/events/events.service';

@Injectable()
export class TasksService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly events: EventsService,
  ) {}

  async create(userId: number, dto: CreateTaskDto) {
    const [task] = await this.db
      .insert(tasks)
      .values({
        userId,
        action: dto.action,
        remindAt: new Date(dto.remindAt),
      })
      .returning();

    this.events.emit({ type: 'tasks', userId });
    return task;
  }

  async findAll(userId: number, q?: string) {
    return this.db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          q ? ilike(tasks.action, `%${q}%`) : undefined,
        ),
      )
      .orderBy(tasks.remindAt);
  }

  async update(id: number, userId: number, dto: UpdateTaskDto) {
    const [task] = await this.db
      .update(tasks)
      .set({
        ...(dto.action !== undefined ? { action: dto.action } : {}),
        ...(dto.remindAt !== undefined ? { remindAt: new Date(dto.remindAt) } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();

    if (!task) throw new NotFoundException('Task not found');

    this.events.emit({ type: 'tasks', userId });
    return task;
  }

  async markComplete(id: number, userId: number) {
    const [existing] = await this.db
      .select({ isCompleted: tasks.isCompleted })
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Task not found');
    }

    const [task] = await this.db
      .update(tasks)
      .set({ isCompleted: !existing.isCompleted, updatedAt: new Date() })
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();

    this.events.emit({ type: 'tasks', userId });
    return task;
  }

  async remove(id: number, userId: number) {
    const [task] = await this.db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    this.events.emit({ type: 'tasks', userId });
    return task;
  }

  async cleanupCompleted(userId: number) {
    const deleted = await this.db
      .delete(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.isCompleted, true)))
      .returning();

    this.events.emit({ type: 'tasks', userId });

    return { deleted: deleted.length };
  }
}

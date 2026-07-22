import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { AuthGuard } from '../auth/auth.guard';
import type { User } from '../../common/database/schema';

@Controller('tasks')
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateTaskDto) {
    const user = req['user'] as User;
    return this.tasksService.create(user.id, dto);
  }

  @Get()
  findAll(@Req() req: Request) {
    const user = req['user'] as User;
    return this.tasksService.findAll(user.id);
  }

  @Patch(':id/complete')
  markComplete(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req['user'] as User;
    return this.tasksService.markComplete(id, user.id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req['user'] as User;
    return this.tasksService.remove(id, user.id);
  }
}

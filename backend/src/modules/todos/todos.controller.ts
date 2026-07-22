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
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { AuthGuard } from '../auth/auth.guard';
import type { User } from '../../common/database/schema';

@Controller('todos')
@UseGuards(AuthGuard)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateTodoDto) {
    const user = req['user'] as User;
    return this.todosService.create(user.id, dto);
  }

  @Get()
  findAll(@Req() req: Request) {
    const user = req['user'] as User;
    return this.todosService.findAll(user.id);
  }

  @Patch(':id/complete')
  markComplete(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req['user'] as User;
    return this.todosService.markComplete(id, user.id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req['user'] as User;
    return this.todosService.remove(id, user.id);
  }

  @Delete('cleanup')
  cleanupCompleted(@Req() req: Request) {
    const user = req['user'] as User;
    return this.todosService.cleanupCompleted(user.id);
  }
}

import { Controller, Sse, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '../../modules/auth/auth.guard';
import { EventsService } from './events.service';
import type { User } from '../database/schema';

@Controller('events')
@UseGuards(AuthGuard)
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Sse()
  stream(@Req() req: Request) {
    const user = req['user'] as User;
    return this.events.stream(user.id);
  }
}

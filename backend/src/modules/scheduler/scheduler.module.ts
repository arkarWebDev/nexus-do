import { Module } from '@nestjs/common';
import { TaskReminderService } from './task-reminder.service';

@Module({
  providers: [TaskReminderService],
})
export class SchedulerModule {}

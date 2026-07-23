import 'dotenv/config';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TelegrafModule } from 'nestjs-telegraf';
import { DatabaseModule } from './common/database/database.module';
import { EventsModule } from './common/events/events.module';
import { EventsController } from './common/events/events.controller';
import { AuthModule } from './modules/auth/auth.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { TodosModule } from './modules/todos/todos.module';
import { UsersModule } from './modules/users/users.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const botToken = process.env.TELEGRAM_BOT_TOKEN;

const conditionalImports = botToken
  ? [
      TelegrafModule.forRoot({ token: botToken }),
      ScheduleModule.forRoot(),
      TelegramModule,
      SchedulerModule,
    ]
  : [
      ScheduleModule.forRoot(),
    ];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ...conditionalImports,
    DatabaseModule,
    EventsModule,
    AuthModule,
    TasksModule,
    TodosModule,
    UsersModule,
  ],
  controllers: [AppController, EventsController],
  providers: [AppService],
})
export class AppModule {}

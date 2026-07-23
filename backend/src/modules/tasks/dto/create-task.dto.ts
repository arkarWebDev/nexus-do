import { IsString, IsNotEmpty, IsISO8601, IsOptional, IsIn } from 'class-validator';

const RECURRENCE_OPTIONS = ['daily', 'weekly', 'weekdays'] as const;

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  action: string;

  @IsISO8601()
  @IsNotEmpty()
  remindAt: string;

  @IsOptional()
  @IsIn(RECURRENCE_OPTIONS)
  recurrence?: (typeof RECURRENCE_OPTIONS)[number];
}

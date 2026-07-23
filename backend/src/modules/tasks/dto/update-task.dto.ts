import { IsString, IsOptional, IsISO8601, IsIn } from 'class-validator';

const RECURRENCE_OPTIONS = ['daily', 'weekly', 'weekdays'] as const;

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  action?: string;

  @IsISO8601()
  @IsOptional()
  remindAt?: string;

  @IsOptional()
  @IsIn(RECURRENCE_OPTIONS)
  recurrence?: (typeof RECURRENCE_OPTIONS)[number] | null;
}

import { IsString, IsOptional, IsISO8601 } from 'class-validator';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  action?: string;

  @IsISO8601()
  @IsOptional()
  remindAt?: string;
}

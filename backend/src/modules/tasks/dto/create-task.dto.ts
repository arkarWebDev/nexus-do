import { IsString, IsNotEmpty, IsISO8601 } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  action: string;

  @IsISO8601()
  @IsNotEmpty()
  remindAt: string;
}

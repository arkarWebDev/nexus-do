import { IsString, IsOptional } from 'class-validator';

export class UpdateTodoDto {
  @IsString()
  @IsOptional()
  action?: string;

  @IsString()
  @IsOptional()
  category?: string;
}

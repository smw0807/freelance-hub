import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateChecklistItemDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsBoolean()
  isDone?: boolean;

  @IsOptional()
  @IsInt()
  order?: number;
}

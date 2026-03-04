import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateTimeLogDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startedAt: string;

  @IsOptional()
  @IsDateString()
  endedAt?: string;
}

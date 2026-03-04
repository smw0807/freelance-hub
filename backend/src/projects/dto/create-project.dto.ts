import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  IsNumber,
  IsDateString,
  IsArray,
} from 'class-validator';
import { Platform, ProjectStatus } from '@prisma/client';

export class CreateProjectDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsInt()
  contractAmount?: number;

  @IsOptional()
  @IsInt()
  depositAmount?: number;

  @IsOptional()
  @IsDateString()
  depositPaidAt?: string;

  @IsOptional()
  @IsInt()
  balanceAmount?: number;

  @IsOptional()
  @IsDateString()
  balancePaidAt?: string;

  @IsOptional()
  @IsBoolean()
  includeVat?: boolean;

  @IsOptional()
  @IsEnum(Platform)
  platform?: Platform;

  @IsOptional()
  @IsNumber()
  platformFeeRate?: number;

  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsOptional()
  @IsDateString()
  deadlineAt?: string;

  @IsOptional()
  @IsDateString()
  deliveredAt?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  memo?: string;
}

import { IsString, IsOptional, IsEnum, IsInt, IsDateString } from 'class-validator';
import { ContractType } from '@prisma/client';

export class CreateContractDto {
  @IsString()
  projectId: string;

  @IsOptional()
  @IsEnum(ContractType)
  type?: ContractType;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsInt()
  totalAmount?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  memo?: string;
}

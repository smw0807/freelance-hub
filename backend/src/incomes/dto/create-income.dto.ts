import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  IsDateString,
} from 'class-validator';
import { IncomeType } from '@prisma/client';

export class CreateIncomeDto {
  @IsString()
  projectId: string;

  @IsOptional()
  @IsEnum(IncomeType)
  incomeType?: IncomeType;

  @IsInt()
  amount: number;

  @IsOptional()
  @IsBoolean()
  isWithholdingTax?: boolean;

  @IsDateString()
  paidAt: string;

  @IsOptional()
  @IsString()
  memo?: string;
}

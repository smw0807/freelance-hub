import { IsOptional, IsEnum, IsBoolean, IsInt, IsDateString, IsString } from 'class-validator';
import { IncomeType } from '@prisma/client';

export class UpdateIncomeDto {
  @IsOptional()
  @IsEnum(IncomeType)
  incomeType?: IncomeType;

  @IsOptional()
  @IsInt()
  amount?: number;

  @IsOptional()
  @IsBoolean()
  isWithholdingTax?: boolean;

  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @IsOptional()
  @IsString()
  memo?: string;
}

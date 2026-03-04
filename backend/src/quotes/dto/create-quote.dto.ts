import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QuoteItemDto {
  @IsString()
  description: string;

  @IsInt()
  quantity: number;

  @IsInt()
  unitPrice: number;

  @IsInt()
  amount: number;
}

export class CreateQuoteDto {
  @IsString()
  projectId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteItemDto)
  items?: QuoteItemDto[];

  @IsOptional()
  @IsInt()
  subtotal?: number;

  @IsOptional()
  @IsInt()
  vatAmount?: number;

  @IsOptional()
  @IsInt()
  discountAmount?: number;

  @IsOptional()
  @IsInt()
  totalAmount?: number;

  @IsOptional()
  @IsString()
  memo?: string;
}

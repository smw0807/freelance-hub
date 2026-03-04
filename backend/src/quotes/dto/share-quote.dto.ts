import { IsOptional, IsDateString } from 'class-validator';

export class ShareQuoteDto {
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

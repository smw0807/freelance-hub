import { IsOptional, IsDateString } from 'class-validator';

export class ShareContractDto {
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

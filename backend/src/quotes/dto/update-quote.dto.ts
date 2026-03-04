import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateQuoteDto } from './create-quote.dto';

export class UpdateQuoteDto extends PartialType(
  OmitType(CreateQuoteDto, ['projectId'] as const),
) {}

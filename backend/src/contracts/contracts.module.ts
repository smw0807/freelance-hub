import { Module } from '@nestjs/common';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { PdfService } from '../quotes/pdf/pdf.service';

@Module({
  controllers: [ContractsController],
  providers: [ContractsService, PdfService],
})
export class ContractsModule {}

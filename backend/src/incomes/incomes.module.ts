import { Module } from '@nestjs/common';
import { IncomesController } from './incomes.controller';
import { IncomesService } from './incomes.service';
import { PdfService } from '../quotes/pdf/pdf.service';

@Module({
  controllers: [IncomesController],
  providers: [IncomesService, PdfService],
})
export class IncomesModule {}

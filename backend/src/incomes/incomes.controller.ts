import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IncomesService } from './incomes.service';
import { PdfService } from '../quotes/pdf/pdf.service';
import { generateIncomeReportHtml } from './pdf/income-report.template';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { QueryIncomeDto } from './dto/query-income.dto';

@Controller('incomes')
@UseGuards(JwtAuthGuard)
export class IncomesController {
  constructor(
    private incomesService: IncomesService,
    private pdfService: PdfService,
  ) {}

  @Get()
  findAll(@CurrentUser() user: any, @Query() query: QueryIncomeDto) {
    return this.incomesService.findAll(user.id, query);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateIncomeDto) {
    return this.incomesService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateIncomeDto,
  ) {
    return this.incomesService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.incomesService.remove(user.id, id);
  }

  @Get('summary')
  getSummary(@CurrentUser() user: any) {
    return this.incomesService.getSummary(user.id);
  }

  @Get('tax-report')
  getTaxReport(@CurrentUser() user: any, @Query('year') year?: string) {
    return this.incomesService.getTaxReport(
      user.id,
      year ? parseInt(year) : undefined,
    );
  }

  @Get('report/pdf')
  async reportPdf(
    @CurrentUser() user: any,
    @Query('year') year: string | undefined,
    @Res() res: Response,
  ) {
    const data = await this.incomesService.getReportData(
      user.id,
      year ? +year : undefined,
    );
    const html = generateIncomeReportHtml(data);
    const pdf = await this.pdfService.generatePdf(html);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="income-report-${data.year}.pdf"`,
    });
    res.send(pdf);
  }
}

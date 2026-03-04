import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { ShareQuoteDto } from './dto/share-quote.dto';

@Controller('quotes')
export class QuotesController {
  constructor(private quotesService: QuotesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser() user: any) {
    return this.quotesService.findAll(user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: any, @Body() dto: CreateQuoteDto) {
    return this.quotesService.create(user.id, dto);
  }

  // Public routes (no auth) — must come before :id routes
  @Get('public/:token')
  getPublic(@Param('token') token: string) {
    return this.quotesService.getPublicByToken(token);
  }

  @Post('public/:token/accept')
  acceptPublic(@Param('token') token: string) {
    return this.quotesService.acceptPublic(token);
  }

  @Post('public/:token/reject')
  rejectPublic(@Param('token') token: string) {
    return this.quotesService.rejectPublic(token);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.quotesService.findOne(user.id, id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateQuoteDto,
  ) {
    return this.quotesService.update(user.id, id, dto);
  }

  @Post(':id/share')
  @UseGuards(JwtAuthGuard)
  share(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: ShareQuoteDto,
  ) {
    return this.quotesService.share(user.id, id, dto);
  }

  @Get(':id/pdf')
  @UseGuards(JwtAuthGuard)
  async getPdf(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const pdf = await this.quotesService.generatePdf(user.id, id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="quote-${id}.pdf"`,
      'Content-Length': pdf.length,
    });
    res.send(pdf);
  }
}

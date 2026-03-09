import {
  Body,
  Controller,
  Delete,
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
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { ShareContractDto } from './dto/share-contract.dto';

@Controller('contracts')
export class ContractsController {
  constructor(private contractsService: ContractsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser() user: any) {
    return this.contractsService.findAll(user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: any, @Body() dto: CreateContractDto) {
    return this.contractsService.create(user.id, dto);
  }

  // Public routes (no auth) — must come before :id routes
  @Get('public/:token')
  getPublic(@Param('token') token: string) {
    return this.contractsService.getPublicByToken(token);
  }

  @Post('public/:token/sign')
  signPublic(
    @Param('token') token: string,
    @Body('signerName') signerName: string,
  ) {
    return this.contractsService.signPublic(token, signerName);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.contractsService.findOne(user.id, id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateContractDto,
  ) {
    return this.contractsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.contractsService.remove(user.id, id);
  }

  @Post(':id/share')
  @UseGuards(JwtAuthGuard)
  share(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: ShareContractDto,
  ) {
    return this.contractsService.share(user.id, id, dto);
  }

  @Get(':id/pdf')
  @UseGuards(JwtAuthGuard)
  async getPdf(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const pdf = await this.contractsService.generatePdf(user.id, id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="contract-${id}.pdf"`,
      'Content-Length': pdf.length,
    });
    res.send(pdf);
  }
}

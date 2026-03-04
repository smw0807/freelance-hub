import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IncomesService } from './incomes.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { QueryIncomeDto } from './dto/query-income.dto';

@Controller('incomes')
@UseGuards(JwtAuthGuard)
export class IncomesController {
  constructor(private incomesService: IncomesService) {}

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
    return this.incomesService.getTaxReport(user.id, year ? parseInt(year) : undefined);
  }
}

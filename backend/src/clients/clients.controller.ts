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
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { QueryClientDto } from './dto/query-client.dto';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get()
  findAll(@CurrentUser() user: any, @Query() query: QueryClientDto) {
    return this.clientsService.findAll(user.id, query);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateClientDto) {
    return this.clientsService.create(user.id, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.clientsService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
  ) {
    return this.clientsService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.clientsService.remove(user.id, id);
  }

  @Get(':id/projects')
  getProjects(@CurrentUser() user: any, @Param('id') id: string) {
    return this.clientsService.getProjects(user.id, id);
  }

  @Get(':id/stats')
  getStats(@CurrentUser() user: any, @Param('id') id: string) {
    return this.clientsService.getStats(user.id, id);
  }
}

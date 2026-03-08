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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { CreateChecklistItemDto } from './dto/create-checklist.dto';
import { CreateTimeLogDto } from './dto/create-timelog.dto';
import { IsEnum } from 'class-validator';
import { ProjectStatus } from '@prisma/client';

class UpdateStatusDto {
  @IsEnum(ProjectStatus)
  status: ProjectStatus;
}

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  findAll(@CurrentUser() user: any, @Query() query: QueryProjectDto) {
    return this.projectsService.findAll(user.id, query);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(user.id, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.projectsService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(user.id, id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.projectsService.updateStatus(user.id, id, dto.status);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.projectsService.remove(user.id, id);
  }

  // Checklist
  @Get(':id/checklist')
  getChecklist(@CurrentUser() user: any, @Param('id') id: string) {
    return this.projectsService.getChecklist(user.id, id);
  }

  @Post(':id/checklist')
  createChecklistItem(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: CreateChecklistItemDto,
  ) {
    return this.projectsService.createChecklistItem(user.id, id, dto);
  }

  @Patch(':id/checklist/:itemId')
  updateChecklistItem(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: Partial<CreateChecklistItemDto>,
  ) {
    return this.projectsService.updateChecklistItem(user.id, id, itemId, dto);
  }

  @Delete(':id/checklist/:itemId')
  removeChecklistItem(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    return this.projectsService.removeChecklistItem(user.id, id, itemId);
  }

  // TimeLogs
  @Get(':id/timelogs')
  getTimeLogs(@CurrentUser() user: any, @Param('id') id: string) {
    return this.projectsService.getTimeLogs(user.id, id);
  }

  @Post(':id/timelogs')
  createTimeLog(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: CreateTimeLogDto,
  ) {
    return this.projectsService.createTimeLog(user.id, id, dto);
  }

  @Patch(':id/timelogs/:logId/stop')
  stopTimeLog(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Param('logId') logId: string,
    @Body('description') description?: string,
  ) {
    return this.projectsService.stopTimeLog(user.id, id, logId, description);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { CreateChecklistItemDto } from './dto/create-checklist.dto';
import { CreateTimeLogDto } from './dto/create-timelog.dto';
import { ProjectStatus } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, query: QueryProjectDto) {
    const { status, startFrom, startTo, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (status) where.status = status;
    if (startFrom || startTo) {
      where.startedAt = {};
      if (startFrom) where.startedAt.gte = new Date(startFrom);
      if (startTo) where.startedAt.lte = new Date(startTo);
    }

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { client: { select: { id: true, name: true } } },
      }),
      this.prisma.project.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(userId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
      include: {
        client: { select: { id: true, name: true } },
        checklistItems: { orderBy: { order: 'asc' } },
        timeLogs: { orderBy: { startedAt: 'desc' } },
        incomes: true,
      },
    });
    if (!project) throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
    return project;
  }

  private async assertOwner(userId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
    });
    if (!project) throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
    return project;
  }

  async create(userId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({ data: { ...dto, userId } });
  }

  async update(userId: string, id: string, dto: UpdateProjectDto) {
    await this.assertOwner(userId, id);
    return this.prisma.project.update({ where: { id }, data: dto });
  }

  async updateStatus(userId: string, id: string, status: ProjectStatus) {
    await this.assertOwner(userId, id);
    return this.prisma.project.update({ where: { id }, data: { status } });
  }

  async remove(userId: string, id: string) {
    await this.assertOwner(userId, id);
    return this.prisma.project.delete({ where: { id } });
  }

  // Checklist
  async getChecklist(userId: string, projectId: string) {
    await this.assertOwner(userId, projectId);
    return this.prisma.checklistItem.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
    });
  }

  async createChecklistItem(
    userId: string,
    projectId: string,
    dto: CreateChecklistItemDto,
  ) {
    await this.assertOwner(userId, projectId);
    const lastItem = await this.prisma.checklistItem.findFirst({
      where: { projectId },
      orderBy: { order: 'desc' },
    });
    const order = dto.order ?? (lastItem ? lastItem.order + 1 : 0);
    return this.prisma.checklistItem.create({
      data: { ...dto, order, projectId },
    });
  }

  async updateChecklistItem(
    userId: string,
    projectId: string,
    itemId: string,
    dto: Partial<CreateChecklistItemDto>,
  ) {
    await this.assertOwner(userId, projectId);
    return this.prisma.checklistItem.update({ where: { id: itemId }, data: dto });
  }

  async removeChecklistItem(userId: string, projectId: string, itemId: string) {
    await this.assertOwner(userId, projectId);
    return this.prisma.checklistItem.delete({ where: { id: itemId } });
  }

  // TimeLogs
  async getTimeLogs(userId: string, projectId: string) {
    await this.assertOwner(userId, projectId);
    return this.prisma.timeLog.findMany({
      where: { projectId },
      orderBy: { startedAt: 'desc' },
    });
  }

  async createTimeLog(
    userId: string,
    projectId: string,
    dto: CreateTimeLogDto,
  ) {
    await this.assertOwner(userId, projectId);
    const data: any = { ...dto, projectId };
    if (dto.startedAt && dto.endedAt) {
      const diff =
        (new Date(dto.endedAt).getTime() - new Date(dto.startedAt).getTime()) /
        60000;
      data.durationMinutes = Math.round(diff);
    }
    return this.prisma.timeLog.create({ data });
  }

  async stopTimeLog(userId: string, projectId: string, logId: string) {
    await this.assertOwner(userId, projectId);
    const log = await this.prisma.timeLog.findUnique({ where: { id: logId } });
    if (!log) throw new NotFoundException();
    const endedAt = new Date();
    const durationMinutes = Math.round(
      (endedAt.getTime() - log.startedAt.getTime()) / 60000,
    );
    return this.prisma.timeLog.update({
      where: { id: logId },
      data: { endedAt, durationMinutes },
    });
  }
}

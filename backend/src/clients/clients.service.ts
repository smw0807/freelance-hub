import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { QueryClientDto } from './dto/query-client.dto';

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, query: QueryClientDto) {
    const { search, isBlacklisted, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (isBlacklisted !== undefined) where.isBlacklisted = isBlacklisted;

    const [data, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.client.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(userId: string, id: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, userId },
    });
    if (!client) {
      this.logger.warn(`Client not found: id=${id} userId=${userId}`);
      throw new NotFoundException('클라이언트를 찾을 수 없습니다.');
    }
    return client;
  }

  async create(userId: string, dto: CreateClientDto) {
    const client = await this.prisma.client.create({ data: { ...dto, userId } });
    this.logger.log(`Client created: id=${client.id} name=${client.name}`);
    return client;
  }

  async update(userId: string, id: string, dto: UpdateClientDto) {
    await this.findOne(userId, id);
    this.logger.log(`Client updated: id=${id}`);
    return this.prisma.client.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    this.logger.log(`Client deleted (soft): id=${id}`);
    return this.prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getProjects(userId: string, clientId: string) {
    await this.findOne(userId, clientId);
    return this.prisma.project.findMany({
      where: { userId, clientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats(userId: string, clientId: string) {
    await this.findOne(userId, clientId);

    const projects = await this.prisma.project.findMany({
      where: { userId, clientId },
      include: { incomes: true },
    });

    const totalProjects = projects.length;
    const totalRevenue = projects.reduce(
      (sum, p) => sum + p.incomes.reduce((s, i) => s + i.netAmount, 0),
      0,
    );
    const completedProjects = projects.filter(
      (p) => p.status === 'COMPLETED',
    ).length;

    return { totalProjects, completedProjects, totalRevenue };
  }
}

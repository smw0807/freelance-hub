import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeDates } from '../common/utils/date.util';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { QueryIncomeDto } from './dto/query-income.dto';

const PLATFORM_LABEL: Record<string, string> = {
  KMONG: '크몽',
  SOOMGO: '숨고',
  ELANCER: '이랜서',
  WANTEDGIGS: '원티드 긱스',
  DIRECT: '직접계약',
  OTHER: '기타',
};

@Injectable()
export class IncomesService {
  private readonly logger = new Logger(IncomesService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, query: QueryIncomeDto) {
    const { year, month } = query;
    const where: any = { userId };

    if (year || month) {
      const y = year ?? new Date().getFullYear();
      const m = month;
      if (m) {
        const start = new Date(y, m - 1, 1);
        const end = new Date(y, m, 0, 23, 59, 59);
        where.paidAt = { gte: start, lte: end };
      } else {
        where.paidAt = {
          gte: new Date(y, 0, 1),
          lte: new Date(y, 11, 31, 23, 59, 59),
        };
      }
    }

    return this.prisma.income.findMany({
      where,
      include: { project: { select: { id: true, title: true } } },
      orderBy: { paidAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateIncomeDto) {
    const project = await this.prisma.project.findFirst({
      where: { id: dto.projectId, userId },
    });
    if (!project) {
      this.logger.warn(`Income create failed - project not found: projectId=${dto.projectId} userId=${userId}`);
      throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
    }

    const isWithholdingTax = dto.isWithholdingTax ?? false;
    const netAmount = isWithholdingTax
      ? Math.round(dto.amount * 0.967)
      : dto.amount;

    const income = await this.prisma.income.create({
      data: { ...normalizeDates(dto), userId, isWithholdingTax, netAmount },
    });
    this.logger.log(`Income created: id=${income.id} amount=${dto.amount} netAmount=${netAmount} projectId=${dto.projectId}`);
    return income;
  }

  async update(userId: string, id: string, dto: UpdateIncomeDto) {
    const income = await this.prisma.income.findFirst({
      where: { id, userId },
    });
    if (!income) {
      this.logger.warn(`Income update failed - not found: id=${id} userId=${userId}`);
      throw new NotFoundException('수입을 찾을 수 없습니다.');
    }

    const amount = dto.amount ?? income.amount;
    const isWithholdingTax = dto.isWithholdingTax ?? income.isWithholdingTax;
    const netAmount = isWithholdingTax ? Math.round(amount * 0.967) : amount;

    this.logger.log(`Income updated: id=${id} netAmount=${netAmount}`);
    return this.prisma.income.update({
      where: { id },
      data: { ...normalizeDates(dto), netAmount },
    });
  }

  async remove(userId: string, id: string) {
    const income = await this.prisma.income.findFirst({
      where: { id, userId },
    });
    if (!income) {
      this.logger.warn(`Income delete failed - not found: id=${id} userId=${userId}`);
      throw new NotFoundException('수입을 찾을 수 없습니다.');
    }
    this.logger.log(`Income deleted: id=${id}`);
    return this.prisma.income.delete({ where: { id } });
  }

  async getSummary(userId: string) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59);

    const [monthlyIncomes, yearlyIncomes, yearlyWithProject] =
      await Promise.all([
        this.prisma.income.findMany({
          where: { userId, paidAt: { gte: monthStart, lte: monthEnd } },
        }),
        this.prisma.income.findMany({
          where: { userId, paidAt: { gte: yearStart, lte: yearEnd } },
        }),
        this.prisma.income.findMany({
          where: { userId, paidAt: { gte: yearStart, lte: yearEnd } },
          include: { project: { select: { platform: true } } },
        }),
      ]);

    // Monthly by month for current year
    const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const incomes = yearlyIncomes.filter(
        (inc) => new Date(inc.paidAt).getMonth() + 1 === m,
      );
      return {
        month: m,
        total: incomes.reduce((s, i) => s + i.netAmount, 0),
      };
    });

    // Platform breakdown
    const platformMap: Record<string, number> = {};
    for (const inc of yearlyWithProject) {
      const platform = (inc as any).project?.platform ?? 'OTHER';
      platformMap[platform] = (platformMap[platform] ?? 0) + inc.netAmount;
    }
    const platformBreakdown = Object.entries(platformMap).map(
      ([platform, total]) => ({
        platform,
        label: PLATFORM_LABEL[platform] ?? platform,
        total,
      }),
    );

    return {
      thisMonth: monthlyIncomes.reduce((s, i) => s + i.netAmount, 0),
      thisYear: yearlyIncomes.reduce((s, i) => s + i.netAmount, 0),
      monthlyBreakdown,
      platformBreakdown,
    };
  }

  async getReportData(userId: string, year?: number) {
    const y = year ?? new Date().getFullYear();
    const taxReport = await this.getTaxReport(userId, y);

    const incomes = await this.prisma.income.findMany({
      where: {
        userId,
        paidAt: {
          gte: new Date(y, 0, 1),
          lte: new Date(y, 11, 31, 23, 59, 59),
        },
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            platform: true,
            client: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { paidAt: 'asc' },
    });

    const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const monthIncomes = incomes.filter(
        (inc) => new Date(inc.paidAt).getMonth() + 1 === m,
      );
      return {
        month: m,
        total: monthIncomes.reduce((s, i) => s + i.netAmount, 0),
        withheld: monthIncomes
          .filter((i) => i.isWithholdingTax)
          .reduce((s, i) => s + Math.round(i.amount * 0.033), 0),
      };
    });

    // Client breakdown
    const clientMap = new Map<
      string,
      { clientName: string; total: number; projectIds: Set<string> }
    >();
    for (const inc of incomes) {
      const client = (inc as any).project?.client;
      const clientKey = client?.id ?? '__none__';
      const clientName = client?.name ?? '(클라이언트 없음)';
      if (!clientMap.has(clientKey)) {
        clientMap.set(clientKey, { clientName, total: 0, projectIds: new Set() });
      }
      const entry = clientMap.get(clientKey)!;
      entry.total += inc.netAmount;
      entry.projectIds.add(inc.projectId);
    }
    const clientBreakdown = Array.from(clientMap.values())
      .map(({ clientName, total, projectIds }) => ({
        clientName,
        total,
        projectCount: projectIds.size,
      }))
      .sort((a, b) => b.total - a.total);

    // Project hourly rates
    const projectIds = [...new Set(incomes.map((i) => i.projectId))];
    const projectsWithTimeLogs = projectIds.length > 0
      ? await this.prisma.project.findMany({
          where: { id: { in: projectIds } },
          select: {
            id: true,
            title: true,
            timeLogs: { select: { durationMinutes: true } },
          },
        })
      : [];

    const projectIncomeMap = new Map<string, number>();
    for (const inc of incomes) {
      projectIncomeMap.set(
        inc.projectId,
        (projectIncomeMap.get(inc.projectId) ?? 0) + inc.netAmount,
      );
    }

    const projectHourlyRates = projectsWithTimeLogs
      .map((p) => {
        const totalNet = projectIncomeMap.get(p.id) ?? 0;
        const totalMinutes = p.timeLogs.reduce(
          (s, t) => s + (t.durationMinutes ?? 0),
          0,
        );
        const hourlyRate =
          totalMinutes > 0
            ? Math.round(totalNet / (totalMinutes / 60))
            : null;
        return { title: p.title, totalNet, totalMinutes, hourlyRate };
      })
      .sort((a, b) => b.totalNet - a.totalNet);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    return {
      user,
      year: y,
      taxReport,
      monthlyBreakdown,
      incomes,
      clientBreakdown,
      projectHourlyRates,
    };
  }

  async getTaxReport(userId: string, year?: number) {
    const y = year ?? new Date().getFullYear();
    const incomes = await this.prisma.income.findMany({
      where: {
        userId,
        paidAt: {
          gte: new Date(y, 0, 1),
          lte: new Date(y, 11, 31, 23, 59, 59),
        },
      },
    });

    const totalRevenue = incomes.reduce((s, i) => s + i.amount, 0);
    const withholdingTaxTotal = incomes
      .filter((i) => i.isWithholdingTax)
      .reduce((s, i) => s + Math.round(i.amount * 0.033), 0);

    // Simplified income tax estimate (종합소득세 기본 계산)
    const estimatedIncomeTax = Math.max(
      0,
      Math.round(totalRevenue * 0.15 - 1260000), // simplified
    );

    return {
      year: y,
      totalRevenue,
      withholdingTaxTotal,
      estimatedIncomeTax,
    };
  }
}

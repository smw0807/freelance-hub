import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { QueryIncomeDto } from './dto/query-income.dto';

@Injectable()
export class IncomesService {
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
    if (!project) throw new NotFoundException('프로젝트를 찾을 수 없습니다.');

    const isWithholdingTax = dto.isWithholdingTax ?? false;
    const netAmount = isWithholdingTax
      ? Math.round(dto.amount * 0.967)
      : dto.amount;

    return this.prisma.income.create({
      data: { ...dto, userId, isWithholdingTax, netAmount },
    });
  }

  async update(userId: string, id: string, dto: UpdateIncomeDto) {
    const income = await this.prisma.income.findFirst({
      where: { id, userId },
    });
    if (!income) throw new NotFoundException('수입을 찾을 수 없습니다.');

    const amount = dto.amount ?? income.amount;
    const isWithholdingTax = dto.isWithholdingTax ?? income.isWithholdingTax;
    const netAmount = isWithholdingTax
      ? Math.round(amount * 0.967)
      : amount;

    return this.prisma.income.update({
      where: { id },
      data: { ...dto, netAmount },
    });
  }

  async remove(userId: string, id: string) {
    const income = await this.prisma.income.findFirst({
      where: { id, userId },
    });
    if (!income) throw new NotFoundException('수입을 찾을 수 없습니다.');
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

    const [monthlyIncomes, yearlyIncomes] = await Promise.all([
      this.prisma.income.findMany({
        where: { userId, paidAt: { gte: monthStart, lte: monthEnd } },
      }),
      this.prisma.income.findMany({
        where: { userId, paidAt: { gte: yearStart, lte: yearEnd } },
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

    return {
      thisMonth: monthlyIncomes.reduce((s, i) => s + i.netAmount, 0),
      thisYear: yearlyIncomes.reduce((s, i) => s + i.netAmount, 0),
      monthlyBreakdown,
    };
  }

  async getTaxReport(userId: string, year?: number) {
    const y = year ?? new Date().getFullYear();
    const incomes = await this.prisma.income.findMany({
      where: {
        userId,
        paidAt: { gte: new Date(y, 0, 1), lte: new Date(y, 11, 31, 23, 59, 59) },
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

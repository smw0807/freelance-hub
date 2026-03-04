import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(userId: string) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59);
    const nextMonth = new Date(year, month + 1, 14);

    const [monthlyIncomes, yearlyIncomes, upcomingDeadlines, unpaidProjects] =
      await Promise.all([
        this.prisma.income.findMany({
          where: { userId, paidAt: { gte: monthStart, lte: monthEnd } },
        }),
        this.prisma.income.findMany({
          where: { userId, paidAt: { gte: yearStart, lte: yearEnd } },
        }),
        this.prisma.project.findMany({
          where: {
            userId,
            status: { in: ['IN_PROGRESS', 'NEGOTIATING'] },
            deadlineAt: { gte: now, lte: nextMonth },
          },
          orderBy: { deadlineAt: 'asc' },
          take: 5,
          include: { client: { select: { name: true } } },
        }),
        this.prisma.project.findMany({
          where: {
            userId,
            status: { in: ['DELIVERED', 'COMPLETED'] },
            balancePaidAt: null,
            balanceAmount: { gt: 0 },
          },
          orderBy: { deadlineAt: 'asc' },
          take: 5,
          include: { client: { select: { name: true } } },
        }),
      ]);

    const thisMonthRevenue = monthlyIncomes.reduce(
      (s, i) => s + i.netAmount,
      0,
    );
    const thisYearRevenue = yearlyIncomes.reduce((s, i) => s + i.netAmount, 0);
    const unpaidTotal = unpaidProjects.reduce(
      (s, p) => s + p.balanceAmount,
      0,
    );

    // Previous month
    const prevMonthStart = new Date(year, month - 1, 1);
    const prevMonthEnd = new Date(year, month, 0, 23, 59, 59);
    const prevMonthIncomes = await this.prisma.income.findMany({
      where: { userId, paidAt: { gte: prevMonthStart, lte: prevMonthEnd } },
    });
    const prevMonthRevenue = prevMonthIncomes.reduce(
      (s, i) => s + i.netAmount,
      0,
    );

    return {
      summary: {
        thisMonthRevenue,
        prevMonthRevenue,
        thisYearRevenue,
        unpaidTotal,
      },
      upcomingDeadlines,
      unpaidProjects,
    };
  }
}

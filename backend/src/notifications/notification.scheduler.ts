import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email.service';
import { KakaoAlimtalkService } from './kakao.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationScheduler {
  private readonly logger = new Logger(NotificationScheduler.name);

  constructor(
    private prisma: PrismaService,
    private notifService: NotificationsService,
    private emailService: EmailService,
    private kakaoService: KakaoAlimtalkService,
  ) {}

  @Cron('0 0 9 * * *', { timeZone: 'Asia/Seoul' })
  async handleDeadlineReminders() {
    this.logger.log('Running deadline reminders...');
    const dayMap: [number, NotificationType][] = [
      [7, NotificationType.DEADLINE_D7],
      [3, NotificationType.DEADLINE_D3],
      [1, NotificationType.DEADLINE_D1],
    ];

    for (const [days, type] of dayMap) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const projects = await this.prisma.project.findMany({
        where: {
          status: 'IN_PROGRESS',
          deadlineAt: { gte: startOfDay, lte: endOfDay },
        },
        include: { user: true },
      });

      for (const project of projects) {
        const alreadySent = await this.notifService.hasSentToday(
          project.userId,
          type,
          project.id,
        );
        if (alreadySent) continue;

        const title = `프로젝트 마감 D-${days}`;
        const message = `"${project.title}" 마감까지 ${days}일 남았습니다.`;
        const link = `/projects/${project.id}`;

        await this.notifService.create(project.userId, type, title, message, link, project.id);

        const user = project.user;
        await this.emailService.sendDeadlineReminder(user.email, user.name, project.title, project.id, days);
        if (user.phone) {
          await this.kakaoService.sendDeadlineReminder(user.phone, project.title, days);
        }
      }
    }
  }

  @Cron('0 0 9 * * *', { timeZone: 'Asia/Seoul' })
  async handleUnpaidReminders() {
    this.logger.log('Running unpaid reminders...');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startOfDay = new Date(sevenDaysAgo);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(sevenDaysAgo);
    endOfDay.setHours(23, 59, 59, 999);

    const projects = await this.prisma.project.findMany({
      where: {
        status: 'DELIVERED',
        deliveredAt: { gte: startOfDay, lte: endOfDay },
        balancePaidAt: null,
      },
      include: { user: true },
    });

    for (const project of projects) {
      const alreadySent = await this.notifService.hasSentToday(
        project.userId,
        NotificationType.UNPAID_REMINDER,
        project.id,
      );
      if (alreadySent) continue;

      const title = '미수금 알림';
      const message = `"${project.title}" 잔금이 납부 대기 중입니다.`;
      const link = `/projects/${project.id}`;

      await this.notifService.create(
        project.userId,
        NotificationType.UNPAID_REMINDER,
        title,
        message,
        link,
        project.id,
      );

      const user = project.user;
      await this.emailService.sendUnpaidReminder(user.email, user.name, project.title, project.id);
      if (user.phone) {
        await this.kakaoService.sendUnpaidReminder(user.phone, project.title);
      }
    }
  }
}

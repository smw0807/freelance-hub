import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { EmailService } from './email.service';
import { KakaoAlimtalkService } from './kakao.service';
import { NotificationScheduler } from './notification.scheduler';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    EmailService,
    KakaoAlimtalkService,
    NotificationScheduler,
  ],
  exports: [NotificationsService, EmailService, KakaoAlimtalkService],
})
export class NotificationsModule {}

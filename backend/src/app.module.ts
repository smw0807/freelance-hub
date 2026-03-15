import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import * as Joi from 'joi';
import { WinstonModule } from 'nest-winston';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { ProjectsModule } from './projects/projects.module';
import { QuotesModule } from './quotes/quotes.module';
import { IncomesModule } from './incomes/incomes.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ContractsModule } from './contracts/contracts.module';
import { NotificationsModule } from './notifications/notifications.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { winstonConfig } from './logger/logger.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().optional(),
        PORT: Joi.number().optional(),
        APP_NAME: Joi.string().required(),
        APP_PORT: Joi.number().default(3002),
        FRONTEND_URL: Joi.string().optional(),
        CORS_ORIGINS: Joi.string().optional(),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        KAKAO_CLIENT_ID: Joi.string().required(),
        KAKAO_REDIRECT_URI: Joi.string().required(),
        SMTP_HOST: Joi.string().optional(),
        SMTP_PORT: Joi.number().optional(),
        SMTP_USER: Joi.string().optional(),
        SMTP_PASS: Joi.string().optional(),
        COOLSMS_API_KEY: Joi.string().optional(),
        COOLSMS_API_SECRET: Joi.string().optional(),
        COOLSMS_FROM: Joi.string().optional(),
        KAKAO_PFID: Joi.string().optional(),
      }),
    }),
    ScheduleModule.forRoot(),
    WinstonModule.forRoot(winstonConfig),
    PrismaModule,
    AuthModule,
    ClientsModule,
    ProjectsModule,
    QuotesModule,
    IncomesModule,
    DashboardModule,
    ContractsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}

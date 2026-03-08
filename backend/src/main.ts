import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { winstonConfig } from './logger/logger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);
  const corsOrigins = (
    configService.get<string>('CORS_ORIGINS') ??
    configService.get<string>('FRONTEND_URL') ??
    'http://localhost:3000,https://freelance-hub-indol.vercel.app'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  const port =
    configService.get<number>('PORT') ??
    configService.get<number>('APP_PORT') ??
    3002;
  await app.listen(port, '0.0.0.0');
  logger.log(`Backend running on http://0.0.0.0:${port}`);
  logger.log(`CORS origins: ${corsOrigins.join(', ')}`);
}
bootstrap();

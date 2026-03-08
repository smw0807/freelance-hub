import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  LoggerService,
  NestInterceptor,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') return next.handle();

    const req = context.switchToHttp().getRequest<Request>();
    const { method, originalUrl, ip } = req;
    const userId = (req as any).user?.userId ?? '-';
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse<Response>();
        const duration = Date.now() - start;
        this.logger.log(
          `${method} ${originalUrl} ${res.statusCode} +${duration}ms user=${userId}`,
          'HTTP',
        );
      }),
      catchError((err) => {
        const duration = Date.now() - start;
        this.logger.error(
          `${method} ${originalUrl} ${err.status ?? 500} +${duration}ms user=${userId} - ${err.message}`,
          err.stack,
          'HTTP',
        );
        return throwError(() => err);
      }),
    );
  }
}

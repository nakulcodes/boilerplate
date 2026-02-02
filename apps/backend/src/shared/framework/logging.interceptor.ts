import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

interface RequestWithReqId extends Request {
  _reqId?: string;
  user?: {
    _id: string;
    email: string;
    organizationId: string;
  };
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<RequestWithReqId>();
    const response = ctx.getResponse<Response>();
    const { method, url, _reqId } = request;

    // Log incoming request
    // @ts-ignore
    const userInfo = request.user
      ? // @ts-ignore

        `User: ${request.user.email} ${request.user.userId}`
      : 'Unauthenticated';
    const userAgent = request.get('user-agent') || 'Unknown';

    this.logger.log(
      `→ ${method} ${url} (${_reqId || 'no-req-id'}) - ${userInfo} - UA: ${userAgent}`,
    );

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;
          this.logResponse(method, url, _reqId, statusCode, duration);
        },
        error: (error: any) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;
          this.logResponse(method, url, _reqId, statusCode, duration, error);
        },
      }),
    );
  }

  private logResponse(
    method: string,
    url: string,
    reqId: string | undefined,
    statusCode: number,
    duration: number,
    error?: any,
  ) {
    if (statusCode >= 500) {
      const message = `← ${method} ${url} (${reqId || 'no-req-id'}) - ${statusCode} (${duration}ms)`;
      this.logger.error(message, error?.stack);
    } else if (statusCode >= 400) {
      const message = `← ${method} ${url} (${reqId || 'no-req-id'}) - ${statusCode} (${duration}ms)`;
      this.logger.warn(message, error?.stack);
    } else {
      const message = `← ${method} ${url} (${reqId || 'no-req-id'}) - ${statusCode} (${duration}ms)`;
      this.logger.log(message);
    }
  }
}

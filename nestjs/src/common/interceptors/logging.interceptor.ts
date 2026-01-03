import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>();
    const { method, url } = request;
    const body = (request.body as Record<string, any>) || {};
    const ip = request.ip || '';
    const userAgent = request.headers['user-agent'] || '';
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const statusCode = response.statusCode;
        const responseTime = Date.now() - startTime;

        // Skip logging for static assets to reduce noise
        if (
          !url.includes('.js') &&
          !url.includes('.css') &&
          !url.includes('.ico') &&
          !url.includes('.png')
        ) {
          this.logger.log(
            `${method} ${url} ${statusCode} +${responseTime}ms - ${ip} - ${userAgent}`,
          );

          // Only log request body for API endpoints and if it contains data
          if (
            (url.startsWith('/api/') || url.includes('register')) &&
            body &&
            Object.keys(body).length > 0
          ) {
            // Mask sensitive data like email
            const sanitizedBody = { ...body };
            if (sanitizedBody.email) {
              sanitizedBody.email = this.maskEmail(sanitizedBody.email);
            }
            this.logger.debug(`Request body: ${JSON.stringify(sanitizedBody)}`);
          }
        }
      }),
    );
  }

  private maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    const maskedLocalPart =
      localPart.length <= 3
        ? '*'.repeat(localPart.length)
        : localPart.substring(0, 2) + '*'.repeat(localPart.length - 2);
    return `${maskedLocalPart}@${domain}`;
  }
}

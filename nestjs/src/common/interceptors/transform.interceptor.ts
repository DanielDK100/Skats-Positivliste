import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  meta: {
    timestamp: string;
    statusCode: number;
  };
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    
    // Skip transformation for view rendering and static assets
    const isApiCall = request.url.startsWith('/api/') ||
                      request.url.includes('investment-companies') ||
                      request.url.includes('top-registrations');
    
    if (!isApiCall) {
      return next.handle();
    }
    
    return next.handle().pipe(
      map(data => ({
        data,
        meta: {
          timestamp: new Date().toISOString(),
          statusCode: ctx.getResponse().statusCode,
        },
      })),
    );
  }
}

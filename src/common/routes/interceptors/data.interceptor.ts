import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

export interface Response<T> {
  data: T;
}

@Injectable()
export class DataInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const status = ctx.getResponse()?.statusCode;
    const path = ctx.getRequest()?.originalUrl;

    return next.handle().pipe(
      map((data) => ({
        success: true,
        status,
        path,
        data,
      })),
    );
  }
}

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { DatabaseException } from '../exceptions/database.exception';

interface ErrorData {
  message: string;
}

@Catch()
export class MainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MainExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    // Check if it's a database error (PostgreSQL errors)
    const isDatabaseError =
      exception?.code ||
      exception?.severity ||
      exception?.detail ||
      exception?.message?.includes('ECONNREFUSED') ||
      exception?.message?.includes('syntax error');

    if (isDatabaseError && !(exception instanceof HttpException)) {
      // Log the actual database error for debugging
      this.logger.error(
        'Database error occurred',
        exception?.message || exception,
      );

      // Wrap in DatabaseException to hide sensitive details
      exception = new DatabaseException(exception);
    }

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      success: false,
      status: httpStatus,
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      data: <ErrorData>{
        message: exception?.response?.message ?? exception.message,
      },
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}

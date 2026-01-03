import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();
    const status = exception.getStatus();

    // Check if this is an API call or a web request
    const isApiCall =
      request.url.startsWith('/api/') ||
      request.url.includes('investment-companies') ||
      request.url.includes('top-registrations');

    if (isApiCall) {
      // For API calls, return JSON
      response.status(status).send({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: exception.message,
      });
    } else if (status === HttpStatus.BAD_REQUEST && request.method === 'POST') {
      // For form submissions, redirect back to the form with error status
      response.status(302).redirect('/?status=danger');
    } else {
      // For web pages, render error page or redirect to home
      response.status(302).redirect('/?status=danger');
    }
  }
}

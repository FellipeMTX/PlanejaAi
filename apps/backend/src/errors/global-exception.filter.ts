import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponse } from './err';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: ErrorResponse = {
      statusCode: status,
      details: ['Erro interno do servidor'],
      fields: {},
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Partial<ErrorResponse>;
        errorResponse = {
          statusCode: status,
          details:
            resp.details || (resp as { message?: string }).message
              ? [String((resp as { message?: string }).message)]
              : [],
          fields: resp.fields || {},
        };
      } else {
        errorResponse = {
          statusCode: status,
          details: [String(exceptionResponse)],
          fields: {},
        };
      }
    } else if (exception instanceof Error) {
      console.error('Unhandled error:', exception);
      errorResponse.details = [
        process.env.NODE_ENV === 'development' ? exception.message : 'Erro interno do servidor',
      ];
    }

    response.status(status).json(errorResponse);
  }
}

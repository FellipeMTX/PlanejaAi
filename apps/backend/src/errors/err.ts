import { HttpException, HttpStatus } from '@nestjs/common';
import { ZodError } from 'zod';

export interface ErrorResponse {
  statusCode: number;
  details: string[];
  fields: Record<string, string[]>;
}

export class SimpleErr extends HttpException {
  constructor(
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST
  ) {
    const response: ErrorResponse = {
      statusCode: status,
      details: [message],
      fields: {},
    };
    super(response, status);
  }
}

export class FieldsErr extends HttpException {
  constructor(
    fields: Record<string, string[]>,
    status: HttpStatus = HttpStatus.BAD_REQUEST
  ) {
    const response: ErrorResponse = {
      statusCode: status,
      details: [],
      fields,
    };
    super(response, status);
  }
}

export class FullInfoErr extends HttpException {
  constructor(
    details: string[],
    fields: Record<string, string[]>,
    status: HttpStatus = HttpStatus.BAD_REQUEST
  ) {
    const response: ErrorResponse = {
      statusCode: status,
      details,
      fields,
    };
    super(response, status);
  }
}

export class FromZodErr extends HttpException {
  constructor(zodError: ZodError) {
    const fields: Record<string, string[]> = {};

    for (const issue of zodError.issues) {
      const path = issue.path.join('.') || 'root';
      if (!fields[path]) {
        fields[path] = [];
      }
      fields[path].push(issue.message);
    }

    const response: ErrorResponse = {
      statusCode: HttpStatus.BAD_REQUEST,
      details: [],
      fields,
    };
    super(response, HttpStatus.BAD_REQUEST);
  }
}

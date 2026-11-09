import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

const INTERNAL_ERROR = 'INTERNAL_ERROR';
const BAD_REQUEST: number = HttpStatus.BAD_REQUEST;

function codeFor(status: number): string {
  if (status === BAD_REQUEST) return 'VALIDATION_ERROR';
  const name: unknown = HttpStatus[status];
  return typeof name === 'string' ? name : INTERNAL_ERROR;
}

/** Express's own errors (e.g. body too large) are not HttpExceptions but carry a 4xx `status`. */
function clientErrorStatus(exception: unknown): number | null {
  if (
    typeof exception !== 'object' ||
    exception === null ||
    !('status' in exception)
  )
    return null;
  const { status } = exception;
  return typeof status === 'number' && status >= 400 && status < 500
    ? status
    : null;
}

/** Nest puts validation messages in an array; join them so `message` is always a string. */
function messageOf(exception: HttpException): string {
  const body = exception.getResponse();
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const { message } = body;
    if (Array.isArray(message)) return message.join('; ');
    if (typeof message === 'string') return message;
  }
  return exception.message;
}

@Catch()
export class ErrorShapeFilter implements ExceptionFilter {
  private readonly logger = new Logger(ErrorShapeFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      response.status(status).json({
        error: { code: codeFor(status), message: messageOf(exception) },
      });
      return;
    }

    const status = clientErrorStatus(exception);
    if (status !== null && exception instanceof Error) {
      response
        .status(status)
        .json({ error: { code: codeFor(status), message: exception.message } });
      return;
    }

    // Unexpected: keep the details in the server log, not in the response.
    this.logger.error(exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: { code: INTERNAL_ERROR, message: 'Something went wrong' },
    });
  }
}

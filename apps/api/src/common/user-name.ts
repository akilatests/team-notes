import {
  BadRequestException,
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

export const USER_HEADER = 'x-user-id';
const USER_NAME_MAX_LENGTH = 100;

// Clients URI-encode the name: header values only allow Latin-1, and names may not be.
export function readUserName(request: Request): string {
  const raw = request.header(USER_HEADER);
  if (!raw) throw new UnauthorizedException(`Missing ${USER_HEADER} header`);
  let name: string;
  try {
    name = decodeURIComponent(raw).trim();
  } catch {
    throw new BadRequestException(`${USER_HEADER} must be URI-encoded`);
  }
  if (!name) throw new UnauthorizedException(`Empty ${USER_HEADER} header`);
  if (name.length > USER_NAME_MAX_LENGTH) {
    throw new BadRequestException(
      `${USER_HEADER} must be at most ${USER_NAME_MAX_LENGTH} characters`,
    );
  }
  return name;
}

@Injectable()
export class UserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    readUserName(context.switchToHttp().getRequest<Request>());
    return true;
  }
}

export const UserName = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    readUserName(context.switchToHttp().getRequest<Request>()),
);

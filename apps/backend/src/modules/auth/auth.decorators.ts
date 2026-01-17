import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const IS_AUTHENTICATED_KEY = 'isAuthenticated';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const Authenticated = () => SetMetadata(IS_AUTHENTICATED_KEY, true);

export interface JwtPayload {
  userId: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);

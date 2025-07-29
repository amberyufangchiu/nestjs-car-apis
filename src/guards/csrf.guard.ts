import { ForbiddenException } from '@nestjs/common';

export class CsrfGuard {
  canActivate(context: any): boolean {
    const request = context.switchToHttp().getRequest();
    const csrfTokenFromHeader =
      request.headers['x-csrf-token'] || request.body.csrfToken;

    const csrfTokenFromCookies = request.cookies.csrfToken || {};

    if (!csrfTokenFromHeader) {
      throw new ForbiddenException('Missing CSRF token');
    }

    if (csrfTokenFromHeader !== csrfTokenFromCookies) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }
}

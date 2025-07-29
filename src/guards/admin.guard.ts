import { CanActivate, ExecutionContext } from '@nestjs/common';

export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { currentUser?: { admin?: boolean } }>();

    if (!request.currentUser) {
      return false;
    }
    return request.currentUser.admin;
  }
}

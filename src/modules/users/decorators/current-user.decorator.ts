import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

import { User } from '../users.entity';

export const CurrentUser = createParamDecorator(
  (data: never, ctx: ExecutionContext): User => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { currentUser?: User }>();
    return request.currentUser;
  },
);

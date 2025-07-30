import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';

import { JwtPayload } from '../../auth/jwt-payload.interface';
import { User } from '../users.entity';
import { UsersService } from '../users.service';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(
    private usersSerivce: UsersService,
    private jwtService: JwtService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context
      .switchToHttp()
      .getRequest<
        Request & { session?: { token?: string }; currentUser?: User }
      >();
    const { token } = request.session || {};

    if (token) {
      const decoded: JwtPayload = this.jwtService.decode(token);
      const { userId } = decoded;
      if (userId) {
        const user = await this.usersSerivce.findUser(userId);
        request.currentUser = user;
      }
    }

    return next.handle();
  }
}

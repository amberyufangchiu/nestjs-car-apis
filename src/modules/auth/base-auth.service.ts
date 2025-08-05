import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

@Injectable()
export class BaseAuthService {
  constructor(
    private readonly configService: ConfigService,
    protected readonly jwtService: JwtService,
  ) {}

  getJwtSecret(): string {
    return this.configService.getOrThrow<string>('JWT_SECRET');
  }

  getJwtExpiresIn(): string {
    return this.configService.get<string>('JWT_EXPIRATION');
  }

  getJwtRefreshSecret(): string {
    return this.configService.get<string>('JWT_REFRESH_SECRET');
  }

  getJwtRefreshExpiresIn(): string {
    return this.configService.get<string>('JWT_REFRESH_EXPIRATION');
  }

  async signToken(payload: Record<string, any>): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    return {
      accessToken: await this.jwtService.signAsync(payload, {
        secret: this.getJwtSecret(),
        expiresIn: this.getJwtExpiresIn(),
      }),

      refreshToken: await this.jwtService.signAsync(
        { ...payload, jti: randomUUID() },
        {
          secret: this.getJwtRefreshSecret(),
          expiresIn: this.getJwtRefreshExpiresIn(),
        },
      ),
    };
  }
}

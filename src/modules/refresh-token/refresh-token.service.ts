import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { BaseAuthService } from '../auth/base-auth.service';
import { JwtPayload } from '../auth/jwt-payload.interface';
import { User } from '../users/users.entity';
import { RefreshToken } from './refresh-token.entity';

@Injectable()
export class RefreshTokenService extends BaseAuthService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    configService: ConfigService,
    jwtService: JwtService,
  ) {
    super(configService, jwtService);
  }

  async create(
    user: User,
    token: string,
    jti: string,
    expiresAt: Date,
    exp: number,
  ): Promise<RefreshToken> {
    const refreshToken = this.refreshTokenRepository.create({
      user,
      token,
      jti,
      expiresAt,
      exp,
    });
    return this.refreshTokenRepository.save(refreshToken);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findOne({ where: { token } });
  }

  async findByJti(jti: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findOne({ where: { jti } });
  }

  async markAsRevoke(token: string): Promise<void> {
    const refreshToken = await this.findByToken(token);
    if (refreshToken) {
      refreshToken.revokedAt = new Date();
      await this.refreshTokenRepository.save(refreshToken);
    }
  }

  async isRevoked(token: string): Promise<boolean> {
    const refreshToken = await this.findByToken(token);
    return !!refreshToken?.revokedAt;
  }

  async markAsUse(token: string): Promise<void> {
    const refreshToken = await this.findByToken(token);
    if (refreshToken) {
      refreshToken.usedAt = new Date();
      await this.refreshTokenRepository.save(refreshToken);
    }
  }

  async isUsed(token: string): Promise<boolean> {
    const refreshToken = await this.findByToken(token);
    return !!refreshToken?.usedAt;
  }

  async isExpired(token: string): Promise<boolean> {
    const refreshToken = await this.findByToken(token);
    if (!refreshToken) {
      throw new NotFoundException('Token not found');
    }

    const expiredAt = new Date(refreshToken.expiresAt);
    return expiredAt < new Date();
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    return await this.jwtService.verifyAsync(token, {
      secret: this.getJwtRefreshSecret(),
    });
  }

  async handleRefreshToken(
    refreshToken: string,
    authService: AuthService,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: JwtPayload;

    try {
      payload = await this.verifyRefreshToken(refreshToken);
    } catch (e) {
      throw new BadRequestException('Invalid refresh token');
    }

    const token = await this.findByToken(refreshToken);
    if (
      !token ||
      (await this.isRevoked(refreshToken)) ||
      (await this.isUsed(refreshToken)) ||
      (await this.isExpired(refreshToken))
    ) {
      throw new BadRequestException('Invalid or expired refresh token');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await authService.signToken({
        userId: payload.userId,
        sub: payload.sub,
      });

    const { exp } = await this.verifyRefreshToken(newRefreshToken);
    await this.create(
      { id: payload.userId } as User,
      newRefreshToken,
      payload.sub,
      new Date(exp * 1000),
      exp,
    );

    await this.markAsUse(refreshToken);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async revokeAllTokens(userId: number): Promise<void> {
    const tokens = await this.refreshTokenRepository.find({
      where: { user: { id: userId } },
    });
    if (tokens.length === 0) {
      throw new NotFoundException('No refresh tokens found for this user');
    }

    for (const token of tokens) {
      await this.markAsRevoke(token.token);
    }
  }
}

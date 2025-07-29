import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CsrfGuard } from 'src/guards/csrf.guard';
import { AuthService } from '../auth/auth.service';
import { RefreshTokenService } from './refresh-token.service';

@Controller('refresh-token')
export class RefreshTokenController {
  constructor(
    private readonly refreshTokenService: RefreshTokenService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(CsrfGuard)
  @Post()
  async refresh(@Req() req) {
    const refreshTokenFromCookies = req.cookies?.refreshToken || {};
    if (!refreshTokenFromCookies) {
      throw new Error('Missing refresh token');
    }
    return this.refreshTokenService.handleRefreshToken(
      refreshTokenFromCookies,
      this.authService,
    );
  }
}

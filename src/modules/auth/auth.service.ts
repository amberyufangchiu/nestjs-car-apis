import { scrypt as _scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from '../otp/otp.service';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { User } from '../users/users.entity';
import { UsersService } from '../users/users.service';
import { BaseAuthService } from './base-auth.service';
import { AuthWithRefreshTokenDto } from './dtos/auth-with-refresh-token.dto';
import { JwtPayload } from './jwt-payload.interface';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService extends BaseAuthService {
  constructor(
    private usersService: UsersService,
    private otpService: OtpService,
    configService: ConfigService,
    jwtService: JwtService,
    private refreshTokenService: RefreshTokenService,
  ) {
    super(configService, jwtService);
  }

  async requestOtp(email: string): Promise<{ message: string }> {
    const [user] = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const secret = this.otpService.generateSecret();
    const otp = this.otpService.generateToken(secret);

    console.log('OTP secret:', secret, 'OTP:', otp);

    await this.usersService.updateUser(user.id, {
      otpSecret: secret,
      isOtpEnabled: true,
    });

    console.log(`OTP for ${email}: ${otp}`);

    return {
      message: 'An OTP has been sent to your email address.',
    };
  }

  async signInWithOtp(
    email: string,
    otp: string,
  ): Promise<AuthWithRefreshTokenDto> {
    const [user] = await this.usersService.findUserByEmail(email);
    if (!user || !user.isOtpEnabled || !user.otpSecret) {
      throw new BadRequestException('Invalid credentials or OTP not enabled');
    }

    const isValid = this.otpService.verifyToken(otp, user.otpSecret);

    console.log('OTP verification result:', isValid);

    if (!isValid) {
      throw new BadRequestException('Invalid OTP');
    }

    await this.usersService.updateUser(user.id, {
      isOtpEnabled: false,
      otpSecret: null,
    });

    const payload: JwtPayload = {
      userId: user.id,
      sub: user.id.toString(),
    };
    const { accessToken, refreshToken } = await this.signToken(payload);

    const { exp } =
      await this.refreshTokenService.verifyRefreshToken(refreshToken);

    await this.refreshTokenService.create(
      user,
      refreshToken,
      payload.sub,
      new Date(exp * 1000),
      exp,
    );

    return { accessToken, refreshToken };
  }

  async signUp(email: string, password?: string): Promise<User> {
    const users = await this.usersService.findUserByEmail(email);
    if (users.length) {
      throw new BadRequestException('Email in use');
    }

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const result = salt + '.' + hash.toString('hex');
    const user = await this.usersService.createUser(email, result);

    return user;
  }

  async signOut(user: User): Promise<void> {
    await this.usersService.updateUser(user.id, {
      isOtpEnabled: false,
      otpSecret: null,
    });
    await this.refreshTokenService.revokeAllTokens(user.id);
  }

  async validateToken(accessToken: string): Promise<{ userId: number }> {
    try {
      const payload = await this.jwtService.verifyAsync(accessToken);

      return { userId: payload.userId };
    } catch (error) {
      throw new BadRequestException('Invalid token');
    }
  }
}

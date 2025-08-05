import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import ms from 'ms';
import { AuthGuard } from 'src/guards/auth.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { User } from '../users/users.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { BaseAuthService } from './base-auth.service';
import { RequestOtpDto } from './dtos/request-otp.dto';
import { SignInWithOtpDto } from './dtos/signin-otp.dto';

@Controller('auth')
export class AuthController extends BaseAuthService {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    configService: ConfigService,
    jwtService: JwtService,
  ) {
    super(configService, jwtService);
  }

  @Get('/me')
  @UseGuards(AuthGuard)
  async getMe(@CurrentUser() user: User) {
    return await this.usersService.findUser(user.id);
  }

  @Post('/signup')
  async createUser(@Body() body: CreateUserDto): Promise<User> {
    const user = await this.authService.signUp(body.email, body.password);
    return user;
  }

  @Post('/email/otp')
  async requestOtp(@Body() body: RequestOtpDto): Promise<{ message: string }> {
    return this.authService.requestOtp(body.email);
  }

  @Post('/signin')
  async signIn(
    @Body() body: SignInWithOtpDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const { accessToken, refreshToken } = await this.authService.signInWithOtp(
      body.email,
      body.otp,
    );
    const csrfToken = Math.random().toString(36).substring(2);

    res.cookie('csrfToken', csrfToken, {
      httpOnly: true,
      secure: false, // ⚠️ don't use with SameSite: 'none'
      sameSite: 'none', // ✅ more forgiving in dev
      maxAge: 60 * 60 * 1000, // milliseconds
      path: '/',
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // set to true in production
      sameSite: 'none',
      maxAge: ms(this.getJwtRefreshExpiresIn()),
      path: '/',
    });

    return { accessToken };
  }

  @Post('/signout')
  @UseGuards(AuthGuard)
  async signOut(
    @CurrentUser() user: User,
    @Res({
      passthrough: true,
    })
    res: Response,
  ): Promise<{ message: string }> {
    await this.authService.signOut(user);

    // clear cookie
    res.cookie('refreshToken', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 0,
    });

    res.cookie('csrfToken', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 0,
    });

    return { message: 'User signed out successfully' };
  }
}

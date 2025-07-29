import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { RefreshTokenController } from './refresh-token.controller';
import { RefreshToken } from './refresh-token.entity';
import { RefreshTokenService } from './refresh-token.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    JwtModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [RefreshTokenController],
  providers: [RefreshTokenService],
  exports: [RefreshTokenService],
})
export class RefreshTokenModule {}

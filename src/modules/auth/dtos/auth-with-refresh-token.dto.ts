import { Expose } from 'class-transformer';

export class AuthWithRefreshTokenDto {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;
}

export interface JwtPayload {
  userId: number;
  sub?: string;
  iat?: number;
  exp?: number;
}

import { ForbiddenException, Injectable } from '@nestjs/common';
import { TOTP } from '@otplib/core';
import { authenticator, totp } from 'otplib';

interface AttemptInfo {
  count: number;
  expiresAt: number;
}

@Injectable()
export class OtpService {
  private readonly totp: TOTP;
  private readonly attempts = new Map<string, AttemptInfo>();
  private readonly MAX_ATTEMPTS = 5;
  private readonly ATTEMPTS_TTL_MS = 3 * 60 * 1000;

  constructor() {
    this.totp = totp.clone();
    this.totp.options = {
      step: 60,
      digits: 6,
      window: 1,
    };
  }

  generateSecret(): string {
    return authenticator.generateSecret();
  }

  generateToken(secret: string): string {
    return this.totp.generate(secret);
  }

  verifyToken(token: string, secret: string): boolean {
    const now = Date.now();
    let attemptInfo = this.attempts.get(secret);

    if (attemptInfo && now > attemptInfo.expiresAt) {
      this.attempts.delete(secret);
      attemptInfo = undefined;
    }

    if (attemptInfo && attemptInfo.count >= this.MAX_ATTEMPTS) {
      throw new ForbiddenException(
        'Too many failed attempts. Please try again later.',
      );
    }

    const isValid = this.totp.check(token, secret);

    if (isValid) {
      this.attempts.delete(secret);
      return true;
    }

    const newCount = (attemptInfo?.count || 0) + 1;
    this.attempts.set(secret, {
      count: newCount,
      expiresAt: now + this.ATTEMPTS_TTL_MS,
    });

    if (newCount >= this.MAX_ATTEMPTS) {
      throw new ForbiddenException(
        'Maximum attempts reached. Please try again later.',
      );
    }

    return false;
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserEntity } from '../../../database/entities';
import {
  generatePasswordResetToken,
  addHours,
  addDays,
} from '@boilerplate/core';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Hash a plain text password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Compare a plain text password with a hashed password
   */
  async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generate access token for a user (1 hour expiry)
   */
  generateAccessToken(user: UserEntity): string {
    const payload = {
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId,
      permissions: [],
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
    };

    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    const expiresIn = this.configService.get('JWT_ACCESS_EXPIRES_IN') ?? '1h';

    return this.jwtService.sign(payload, {
      secret: accessSecret,
      expiresIn,
    });
  }

  /**
   * Generate refresh token for a user (30 days expiry)
   */
  generateRefreshToken(user: UserEntity): string {
    const payload = {
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId,
    };

    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const expiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN') ?? '30d';

    return this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn,
    });
  }

  /**
   * Verify refresh token
   */
  async verifyRefreshToken(token: string): Promise<any> {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    return this.jwtService.verify(token, { secret: refreshSecret });
  }

  /**
   * Calculate refresh token expiry (30 days from now)
   */
  getRefreshTokenExpiry(): Date {
    return addDays(30);
  }

  /**
   * Generate JWT token for a user (legacy method - uses access token)
   */
  generateJwtToken(user: UserEntity): string {
    return this.generateAccessToken(user);
  }

  /**
   * Generate a password reset token (uses application-generic utility)
   */
  generatePasswordResetToken(): string {
    return generatePasswordResetToken();
  }

  /**
   * Calculate password reset token expiry (1 hour from now)
   */
  getPasswordResetExpiry(): Date {
    return addHours(1);
  }
}

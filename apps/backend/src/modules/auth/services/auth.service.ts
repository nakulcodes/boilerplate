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

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  generateAccessToken(
    user: UserEntity,
    permissions: string[] = [],
    impersonatedBy?: string,
  ): string {
    const payload: Record<string, unknown> = {
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId,
      permissions,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      roleId: user.roleId ?? null,
    };

    if (impersonatedBy) {
      payload.impersonatedBy = impersonatedBy;
    }

    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    const expiresIn = this.configService.get('JWT_ACCESS_EXPIRES_IN') ?? '1h';

    return this.jwtService.sign(payload, {
      secret: accessSecret,
      expiresIn,
    });
  }

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

  async verifyRefreshToken(token: string): Promise<any> {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    return this.jwtService.verify(token, { secret: refreshSecret });
  }

  getRefreshTokenExpiry(): Date {
    return addDays(30);
  }

  generateJwtToken(user: UserEntity): string {
    return this.generateAccessToken(user);
  }

  generatePasswordResetToken(): string {
    return generatePasswordResetToken();
  }

  getPasswordResetExpiry(): Date {
    return addHours(1);
  }
}

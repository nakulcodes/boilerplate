import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import {
  generatePasswordResetToken,
  addHours,
  addDays,
} from '@boilerplate/core';
import { UserEntity } from '../../../database/entities';

export interface JWTPayload {
  userId: string;
  email: string;
  organizationId: string;
  permissions?: string[];
  firstName?: string;
  lastName?: string;
}

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

  generatePasswordResetToken(): string {
    return generatePasswordResetToken();
  }

  getPasswordResetExpiry(): Date {
    return addHours(1);
  }

  getInviteTokenExpiry(): Date {
    return addDays(1);
  }

  getRefreshTokenExpiry(): Date {
    return addDays(30);
  }

  generateAccessToken(
    user: UserEntity,
    permissions: string[] = [],
    impersonatorId?: string,
  ): string {
    const payload: JWTPayload & { impersonatorId?: string } = {
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId,
      permissions,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
    };

    if (impersonatorId) {
      payload.impersonatorId = impersonatorId;
    }

    return this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('JWT_ACCESS_SECRET') ||
        this.configService.get<string>('SUPABASE_JWT_SECRET'),
      expiresIn: '1h',
    });
  }

  generateRefreshToken(user: UserEntity): string {
    const payload = {
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId,
    };

    return this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        this.configService.get<string>('SUPABASE_JWT_SECRET'),
      expiresIn: '30d',
    });
  }

  generateJwtToken(user: UserEntity): string {
    return this.generateAccessToken(user, []);
  }
}

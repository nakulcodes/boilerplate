import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserRepository } from '../../../database/repositories';

import { UserSessionData } from '../../shared/decorators/user-session.decorator';

interface RefreshJwtPayload {
  userId: string;
  email: string;
  organizationId: string;
}

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
  ) {
    const refreshSecret = configService.get<string>('JWT_REFRESH_SECRET');
    if (!refreshSecret) {
      throw new Error(
        'JWT_REFRESH_SECRET is not defined in environment variables',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: refreshSecret,
    });
  }

  async validate(payload: RefreshJwtPayload): Promise<UserSessionData> {
    const user = await this.userRepository.findOne({
      where: { id: payload.userId },
      select: [
        'id',
        'email',
        'organizationId',
        'isActive',
        'refreshToken',
        'refreshTokenExpires',
      ],
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Check if refresh token has expired
    if (user.refreshTokenExpires && user.refreshTokenExpires < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    return {
      userId: payload.userId,
      email: payload.email,
      organizationId: payload.organizationId,
      permissions: [],
    };
  }
}

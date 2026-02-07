import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserRepository } from '@db/repositories';

import { UserSessionData } from '../../shared/decorators/user-session.decorator';

interface JwtPayload {
  userId: string;
  email: string;
  organizationId: string;
  permissions: string[];
  roleId?: string;
}

@Injectable()
export class AccessJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
  ) {
    const accessSecret = configService.get<string>('JWT_ACCESS_SECRET');
    if (!accessSecret) {
      throw new Error(
        'JWT_ACCESS_SECRET is not defined in environment variables',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: accessSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<UserSessionData> {
    const user = await this.userRepository.findOne({
      where: { id: payload.userId },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      userId: payload.userId,
      email: payload.email,
      organizationId: payload.organizationId,
      permissions: payload.permissions,
      roleId: payload.roleId,
    };
  }
}

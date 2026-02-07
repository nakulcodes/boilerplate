import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserRepository } from '../../../database/repositories';

import { UserSessionData } from '../../shared/decorators/user-session.decorator';

interface SupabaseJwtPayload {
  sub: string;
  email?: string;
  organization_id?: string;
  permissions?: string[];
  role_id?: string;
  first_name?: string;
  last_name?: string;
  aud: string;
  role: string;
  exp: number;
  iat: number;
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
    const jwtSecret = configService.get<string>('SUPABASE_JWT_SECRET');
    if (!jwtSecret) {
      throw new Error(
        'SUPABASE_JWT_SECRET is not defined in environment variables',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: SupabaseJwtPayload): Promise<UserSessionData> {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token: missing user ID');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      userId: payload.sub,
      email: payload.email || user.email,
      organizationId: payload.organization_id || user.organizationId,
      permissions: payload.permissions || [],
      roleId: payload.role_id,
    };
  }
}

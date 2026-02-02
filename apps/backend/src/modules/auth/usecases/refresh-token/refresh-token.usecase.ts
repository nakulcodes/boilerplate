import { Injectable, UnauthorizedException } from '@nestjs/common';

import { UserRepository, RoleRepository } from '../../../../database/repositories';

import { AuthService } from '../../services/auth.service';
import { RefreshTokenCommand } from './refresh-token.command';
import { RefreshTokenResponseDto } from '../../dtos/refresh-token.dto';

@Injectable()
export class RefreshToken {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(
    command: RefreshTokenCommand,
  ): Promise<RefreshTokenResponseDto> {
    // Find user with refresh token explicitly selected
    const user = await this.userRepository.findOne({
      where: {
        id: command.userId,
        organizationId: command.organizationId,
      },
      select: [
        'id',
        'email',
        'organizationId',
        'isActive',
        'firstName',
        'lastName',
        'roleId',
        'refreshToken',
        'refreshTokenExpires',
      ],
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Validate refresh token matches stored token
    if (user.refreshToken !== command.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if refresh token has expired
    if (user.refreshTokenExpires && user.refreshTokenExpires < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Load role permissions for access token
    const role = user.roleId
      ? await this.roleRepository.findById(user.roleId)
      : null;

    // Generate new access token
    const accessToken = this.authService.generateAccessToken(
      user,
      role?.permissions ?? [],
    );

    // Generate new refresh token (token rotation)
    const refreshToken = this.authService.generateRefreshToken(user);
    const refreshTokenExpires = this.authService.getRefreshTokenExpiry();

    // Update refresh token in database
    user.refreshToken = refreshToken;
    user.refreshTokenExpires = refreshTokenExpires;
    await this.userRepository.save(user);

    return {
      accessToken,
      refreshToken,
    };
  }
}

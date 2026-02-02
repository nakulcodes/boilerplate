import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../../../database/repositories';
import { LogoutCommand } from './logout.command';
import { LogoutResponseDto } from '../../dtos/logout.dto';

@Injectable()
export class Logout {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: LogoutCommand): Promise<LogoutResponseDto> {
    // If refresh token is provided, invalidate it by clearing from database
    if (command.refreshToken && command.userId) {
      const user = await this.userRepository.findOne({
        where: {
          id: command.userId,
          organizationId: command.organizationId,
        },
        select: ['id', 'refreshToken'],
      });

      // Only clear refresh token if it matches the provided token
      if (user && user.refreshToken === command.refreshToken) {
        user.refreshToken = null;
        user.refreshTokenExpires = null;
        await this.userRepository.save(user);
      }
    } else if (command.userId) {
      // If no refresh token provided but user is authenticated, clear all tokens for that user
      const user = await this.userRepository.findOne({
        where: {
          id: command.userId,
          organizationId: command.organizationId,
        },
        select: ['id', 'refreshToken'],
      });

      if (user) {
        user.refreshToken = null;
        user.refreshTokenExpires = null;
        await this.userRepository.save(user);
      }
    }

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}

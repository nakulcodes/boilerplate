import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { UserRepository } from '@db/repositories';
import { AuthService } from '../../services/auth.service';
import { ImpersonateCommand } from './impersonate.command';
import { LoginResponseDto } from '../../dtos/auth-response.dto';

@Injectable()
export class Impersonate {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(command: ImpersonateCommand): Promise<LoginResponseDto> {
    if (command.userId === command.targetUserId) {
      throw new BadRequestException('Cannot impersonate yourself');
    }

    const targetUser = await this.userRepository.findOne({
      where: {
        id: command.targetUserId,
        organizationId: command.organizationId,
      },
      relations: { organization: true, role: true },
    });

    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    if (!targetUser.isActive) {
      throw new ForbiddenException('Cannot impersonate an inactive user');
    }

    const accessToken = this.authService.generateAccessToken(
      targetUser,
      targetUser.role?.permissions ?? [],
      command.userId,
    );
    const refreshToken = this.authService.generateRefreshToken(targetUser);
    const refreshTokenExpires = this.authService.getRefreshTokenExpiry();

    targetUser.refreshToken = refreshToken;
    targetUser.refreshTokenExpires = refreshTokenExpires;
    await this.userRepository.save(targetUser);

    return {
      accessToken,
      refreshToken,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        firstName: targetUser.firstName ?? '',
        lastName: targetUser.lastName,
        organizationId: targetUser.organizationId,
      },
      organization: {
        id: targetUser.organization.id,
        name: targetUser.organization.name,
      },
    };
  }
}

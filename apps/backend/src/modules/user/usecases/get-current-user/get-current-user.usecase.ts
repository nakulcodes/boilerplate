import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '@db/repositories';
import { UserStatus } from '@db/enums';
import { buildUrl } from '@boilerplate/core';

@Injectable()
export class GetCurrentUser {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(userId: string) {
    // Need to fetch with inviteToken for INVITED users
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { organization: true, role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Build invite link if user is in INVITED state
    const frontendBaseUrl = this.configService.get<string>('FRONTEND_BASE_URL');
    const inviteLink =
      user.status === UserStatus.INVITED && user.inviteToken
        ? buildUrl(frontendBaseUrl, `/accept-invite?token=${user.inviteToken}`)
        : null;

    // Return secure user data (exclude sensitive fields)
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      isActive: user.isActive,
      onboarded: user.onboarded,
      organizationId: user.organizationId,
      organization: user.organization,
      roleId: user.roleId,
      role: user.role ? { id: user.role.id, name: user.role.name } : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      invitedBy: user.invitedBy,
      inviteLink,
      inviteExpires: user.inviteExpires,
    };
  }
}

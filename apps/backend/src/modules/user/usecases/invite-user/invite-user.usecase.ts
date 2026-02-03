import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  UserRepository,
  RoleRepository,
} from '../../../../database/repositories';
import { UserStatus } from '../../../../database/enums';
import { buildUrl, generateInviteToken, addHours } from '@boilerplate/core';

import { InviteUserCommand } from './invite-user.command';

export interface InviteUserResult {
  userId: string;
  inviteLink: string;
  emailSent: boolean;
}

@Injectable()
export class InviteUser {
  private readonly logger = new Logger(InviteUser.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: InviteUserCommand): Promise<InviteUserResult> {
    const existingUser = await this.userRepository.findOne({
      where: {
        email: command.email.toLowerCase(),
        organizationId: command.organizationId,
      },
    });
    if (existingUser) {
      throw new ConflictException(
        'User with this email already exists in this organization',
      );
    }

    if (command.roleId) {
      const role = await this.roleRepository.findOne({
        where: { id: command.roleId, organizationId: command.organizationId },
      });
      if (!role) {
        throw new ConflictException('Role not found in this organization');
      }
    }

    // Generate invite token (24 hour expiry)
    const inviteToken = generateInviteToken();
    const inviteExpires = addHours(24);

    // Create user with invited status (no password yet - user will set during onboarding)
    const user = this.userRepository.create({
      email: command.email.toLowerCase(),
      password: null,
      firstName: command.firstName || null,
      lastName: command.lastName || null,
      organizationId: command.organizationId,
      invitedBy: command.invitedBy,
      roleId: command.roleId || null,
      status: UserStatus.INVITED,
      isActive: false,
      onboarded: false,
      inviteToken,
      inviteExpires,
    });

    // Save user to database
    const savedUser = await this.userRepository.save(user);

    // Build invite link
    const frontendBaseUrl = this.configService.get<string>('FRONTEND_BASE_URL');
    const inviteLink = buildUrl(
      frontendBaseUrl,
      `/accept-invite?token=${inviteToken}`,
    );

    // Get inviter details
    const inviter = await this.userRepository.findById(command.invitedBy);
    const inviterName = inviter
      ? `${inviter.firstName} ${inviter.lastName || ''}`.trim()
      : 'Someone';

    // Get organization details
    const userWithOrg = await this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: { organization: true },
    });

    // TODO: Send invitation email (no credentials - user onboards themselves)
    // For now, just log the invite link
    this.logger.log(`Invite link for ${command.email}: ${inviteLink}`);
    this.logger.log(
      `Inviter: ${inviterName}, Organization: ${userWithOrg?.organization.name || 'Organization'}`,
    );

    return {
      userId: savedUser.id,
      inviteLink,
      emailSent: false,
    };
  }
}

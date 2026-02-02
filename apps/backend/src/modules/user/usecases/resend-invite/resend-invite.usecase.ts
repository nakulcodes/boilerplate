import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../../../../database/repositories';
import { UserStatus } from '../../../../database/enums';
import { buildUrl } from '@boilerplate/core';
import { ResendInviteCommand } from './resend-invite.command';

export interface ResendInviteResult {
  inviteLink: string;
  emailSent: boolean;
}

@Injectable()
export class ResendInvite {
  private readonly logger = new Logger(ResendInvite.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: ResendInviteCommand): Promise<ResendInviteResult> {
    // Find user
    const user = await this.userRepository.findOne({
      where: { id: command.userId, organizationId: command.organizationId },
      relations: { organization: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate user is still invited and not onboarded
    if (user.status !== UserStatus.INVITED || user.onboarded) {
      throw new BadRequestException('User has already completed onboarding');
    }

    // Extend invite expiry (24 hours from now)
    user.inviteExpires = new Date();
    user.inviteExpires.setHours(user.inviteExpires.getHours() + 24);

    await this.userRepository.save(user);

    // Build invite link (using existing token)
    const frontendBaseUrl = this.configService.get<string>('FRONTEND_BASE_URL');
    const inviteLink = buildUrl(
      frontendBaseUrl,
      `/accept-invite?token=${user.inviteToken}`,
    );

    // Get inviter details
    const inviter = await this.userRepository.findById(command.currentUserId);
    const inviterName = inviter
      ? `${inviter.firstName} ${inviter.lastName || ''}`.trim()
      : 'Someone';

    // TODO: Resend invitation email (no password)
    // For now, just log the invite link
    this.logger.log(`Resend invite link for ${user.email}: ${inviteLink}`);
    this.logger.log(`Inviter: ${inviterName}, Organization: ${user.organization.name}`);

    return {
      inviteLink,
      emailSent: false,
    };
  }
}

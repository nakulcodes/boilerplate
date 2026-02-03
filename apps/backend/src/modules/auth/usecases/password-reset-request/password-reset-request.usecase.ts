import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { buildUrl } from '@boilerplate/core';
import { EventName, UserPasswordResetRequestedEvent } from '@boilerplate/core';
import { UserRepository } from '../../../../database/repositories';
import { AuthService } from '../../services/auth.service';
import { AppEventEmitter } from '../../../events/services/event-emitter.service';
import { PasswordResetRequestCommand } from './password-reset-request.command';

@Injectable()
export class PasswordResetRequest {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: AppEventEmitter,
  ) {}

  async execute(
    command: PasswordResetRequestCommand,
  ): Promise<{ success: boolean }> {
    // Find user by email with organization
    const email = command.email.toLowerCase().trim();
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['organization'],
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return { success: true };
    }

    // Generate password reset token
    const token = this.authService.generatePasswordResetToken();
    const expiry = this.authService.getPasswordResetExpiry();

    user.passwordResetToken = token;
    user.passwordResetExpires = expiry;
    await this.userRepository.save(user);

    const frontendBaseUrl = this.configService.get<string>('FRONTEND_BASE_URL');
    const resetLink = buildUrl(
      frontendBaseUrl,
      `/reset-password?token=${token}`,
    );

    this.eventEmitter.emit<UserPasswordResetRequestedEvent>({
      eventName: EventName.USER_PASSWORD_RESET_REQUESTED,
      timestamp: new Date(),
      userId: user.id,
      resetLink,
    });

    return { success: true };
  }
}

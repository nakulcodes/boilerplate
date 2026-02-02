import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../../../../database/repositories';
import { AuthService } from '../../services/auth.service';
import { PasswordResetRequestCommand } from './password-reset-request.command';

@Injectable()
export class PasswordResetRequest {
  private readonly logger = new Logger(PasswordResetRequest.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
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

    // Save token to user
    user.passwordResetToken = token;
    user.passwordResetExpires = expiry;
    await this.userRepository.save(user);

    // TODO: Send password reset email
    // For now, just log the token (in production, send via email)
    this.logger.log(`Password reset token for ${user.email}: ${token}`);

    // Always return success to prevent email enumeration
    return { success: true };
  }
}

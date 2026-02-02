import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from '../../../../database/repositories';
import { AuthService } from '../../services/auth.service';
import { PasswordResetCommand } from './password-reset.command';

@Injectable()
export class PasswordReset {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(command: PasswordResetCommand): Promise<{ token: string }> {
    // Find user by reset token
    const user = await this.userRepository.findOne({
      where: { passwordResetToken: command.token },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Check if token has expired
    if (!user.passwordResetExpires || new Date() > user.passwordResetExpires) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const passwordHash = await this.authService.hashPassword(command.password);

    // Update user password and clear reset token
    user.password = passwordHash;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await this.userRepository.save(user);

    // Generate new JWT token
    const token = this.authService.generateJwtToken(user);

    return { token };
  }
}

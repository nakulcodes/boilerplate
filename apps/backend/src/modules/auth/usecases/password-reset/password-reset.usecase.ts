import { BadRequestException, Injectable } from '@nestjs/common';
import { EventName, UserPasswordResetEvent } from '@boilerplate/core';
import { UserRepository } from '@db/repositories';
import { AuthService } from '../../services/auth.service';
import { AppEventEmitter } from '@modules/events/services/event-emitter.service';
import { PasswordResetCommand } from './password-reset.command';

@Injectable()
export class PasswordReset {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
    private readonly eventEmitter: AppEventEmitter,
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

    user.password = passwordHash;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await this.userRepository.save(user);

    this.eventEmitter.emit<UserPasswordResetEvent>({
      eventName: EventName.USER_PASSWORD_RESET,
      timestamp: new Date(),
      userId: user.id,
      triggeredBy: user.id,
    });

    const token = this.authService.generateJwtToken(user);

    return { token };
  }
}

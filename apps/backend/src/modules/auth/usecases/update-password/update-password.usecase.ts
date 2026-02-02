import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from '../../../../database/repositories';
import { AuthService } from '../../services/auth.service';
import { UpdatePasswordCommand } from './update-password.command';

@Injectable()
export class UpdatePassword {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(command: UpdatePasswordCommand): Promise<void> {
    // Validate passwords match
    if (command.newPassword !== command.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Find user
    const user = await this.userRepository.findOne({
      where: { id: command.userId, organizationId: command.organizationId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.authService.comparePasswords(
      command.currentPassword,
      user.password ?? '',
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash and update new password
    const newPasswordHash = await this.authService.hashPassword(
      command.newPassword,
    );
    user.password = newPasswordHash;
    await this.userRepository.save(user);
  }
}

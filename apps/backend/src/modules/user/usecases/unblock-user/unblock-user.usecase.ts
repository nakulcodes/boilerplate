import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../../../database/repositories';
import { UserStatus } from '../../../../database/enums';
import { UnblockUserCommand } from './unblock-user.command';

@Injectable()
export class UnblockUser {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: UnblockUserCommand) {
    // Find user
    const user = await this.userRepository.findOne({
      where: { id: command.userId, organizationId: command.organizationId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update status
    user.status = UserStatus.ACTIVE;
    user.isActive = true;

    await this.userRepository.save(user);

    return { success: true };
  }
}

import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../../../../database/repositories';
import { UserStatus } from '../../../../database/enums';
import { BlockUserCommand } from './block-user.command';

@Injectable()
export class BlockUser {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: BlockUserCommand) {
    // Cannot block self
    if (command.userId === command.currentUserId) {
      throw new BadRequestException('Cannot block yourself');
    }

    // Find user
    const user = await this.userRepository.findOne({
      where: { id: command.userId, organizationId: command.organizationId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update status
    user.status = UserStatus.BLOCKED;
    user.isActive = false;

    await this.userRepository.save(user);

    return { success: true };
  }
}

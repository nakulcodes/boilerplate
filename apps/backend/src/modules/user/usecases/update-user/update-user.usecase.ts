import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../../../database/repositories';
import { UpdateUserCommand } from './update-user.command';

@Injectable()
export class UpdateUser {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: UpdateUserCommand) {
    const user = await this.userRepository.findOne({
      where: { id: command.userId, organizationId: command.organizationId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (command.firstName !== undefined) {
      user.firstName = command.firstName;
    }

    if (command.lastName !== undefined) {
      user.lastName = command.lastName;
    }

    await this.userRepository.save(user);

    return { success: true };
  }
}

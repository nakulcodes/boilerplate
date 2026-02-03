import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import {
  UserRepository,
  RoleRepository,
} from '../../../../database/repositories';
import { getPermissionScope } from '@boilerplate/core';
import { UpdateUserCommand } from './update-user.command';

@Injectable()
export class UpdateUser {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(command: UpdateUserCommand) {
    const user = await this.userRepository.findOne({
      where: { id: command.userId, organizationId: command.organizationId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (command.permissions && command.currentUserId) {
      const scope = getPermissionScope(command.permissions, 'user:update');
      if (scope === 'own') {
        if (user.invitedBy !== command.currentUserId) {
          throw new ForbiddenException('You can only update users you invited');
        }
      } else if (scope === 'team') {
        if (user.roleId !== command.currentUserRoleId) {
          throw new ForbiddenException(
            'You can only update users in your team',
          );
        }
      }
    }

    if (command.firstName !== undefined) {
      user.firstName = command.firstName;
    }

    if (command.lastName !== undefined) {
      user.lastName = command.lastName;
    }

    if (command.roleId !== undefined) {
      const role = await this.roleRepository.findOne({
        where: { id: command.roleId, organizationId: command.organizationId },
      });
      if (!role) {
        throw new BadRequestException('Role not found in this organization');
      }
      user.roleId = command.roleId;
    }

    await this.userRepository.save(user);

    return { success: true };
  }
}

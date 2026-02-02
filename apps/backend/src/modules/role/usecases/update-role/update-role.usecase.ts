import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ALL_PERMISSIONS } from '@boilerplate/core';
import { RoleRepository } from '../../../../database/repositories';
import { RoleEntity } from '../../../../database/entities';
import { UpdateRoleCommand } from './update-role.command';

@Injectable()
export class UpdateRole {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(command: UpdateRoleCommand): Promise<RoleEntity> {
    const role = await this.roleRepository.findById(command.roleId);
    if (!role || role.organizationId !== command.organizationId) {
      throw new NotFoundException('Role not found');
    }

    if (command.permissions) {
      const invalidPermissions = command.permissions.filter(
        (p) => !ALL_PERMISSIONS.includes(p as any),
      );
      if (invalidPermissions.length > 0) {
        throw new BadRequestException(
          `Invalid permissions: ${invalidPermissions.join(', ')}`,
        );
      }
    }

    if (command.name && command.name !== role.name) {
      const existing = await this.roleRepository.findOne({
        where: { name: command.name, organizationId: command.organizationId },
      });
      if (existing) {
        throw new ConflictException('A role with this name already exists');
      }
      role.name = command.name;
    }

    if (command.permissions) {
      role.permissions = command.permissions;
    }

    return this.roleRepository.save(role);
  }
}

import { Injectable } from '@nestjs/common';
import { RoleRepository } from '../../../../database/repositories';
import { RoleEntity } from '../../../../database/entities';
import { ListRolesCommand } from './list-roles.command';

@Injectable()
export class ListRoles {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(command: ListRolesCommand): Promise<RoleEntity[]> {
    return this.roleRepository.findByOrganizationId(command.organizationId);
  }
}

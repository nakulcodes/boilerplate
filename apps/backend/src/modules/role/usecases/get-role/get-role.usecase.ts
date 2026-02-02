import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleRepository } from '../../../../database/repositories';
import { RoleEntity } from '../../../../database/entities';

@Injectable()
export class GetRole {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(roleId: string, organizationId: string): Promise<RoleEntity> {
    const role = await this.roleRepository.findById(roleId);
    if (!role || role.organizationId !== organizationId) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }
}

import { Injectable } from '@nestjs/common';
import { ALL_PERMISSIONS } from '@boilerplate/core';
import { RoleRepository } from '../repositories/role.repository';

@Injectable()
export class DatabaseSeederService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async seedOrganizationDefaults(organizationId: string) {
    await this.ensureDefaultRole(organizationId);
  }

  private async ensureDefaultRole(organizationId: string) {
    const existing = await this.roleRepository.findDefaultRole(organizationId);
    if (existing) {
      return existing;
    }

    const adminRole = this.roleRepository.create({
      name: 'Admin',
      permissions: ALL_PERMISSIONS,
      organizationId,
      isDefault: true,
    });

    return this.roleRepository.save(adminRole);
  }
}

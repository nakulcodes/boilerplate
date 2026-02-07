import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationRepository } from '@db/repositories';
import { OrganizationEntity } from '@db/entities';

@Injectable()
export class GetOrganization {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(organizationId: string): Promise<OrganizationEntity> {
    const organization =
      await this.organizationRepository.findById(organizationId);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return organization;
  }
}

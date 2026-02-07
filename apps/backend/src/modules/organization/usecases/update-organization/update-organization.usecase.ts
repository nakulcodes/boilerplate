import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrganizationRepository } from '@db/repositories';
import { OrganizationEntity } from '@db/entities';
import { UpdateOrganizationCommand } from './update-organization.command';

@Injectable()
export class UpdateOrganization {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    command: UpdateOrganizationCommand,
  ): Promise<OrganizationEntity> {
    const organization = await this.organizationRepository.findById(
      command.organizationId,
    );
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (command.domain && command.domain !== organization.domain) {
      const existing = await this.organizationRepository.findOne({
        where: { domain: command.domain },
      });
      if (existing && existing.id !== organization.id) {
        throw new ConflictException(
          'Domain already in use by another organization',
        );
      }
      organization.domain = command.domain;
    }

    if (command.name !== undefined) {
      organization.name = command.name;
    }

    if (command.logoUrl !== undefined) {
      organization.logoUrl = command.logoUrl;
    }

    return this.organizationRepository.save(organization);
  }
}

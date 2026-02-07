import { Module } from '@nestjs/common';
import { OrganizationController } from './organization.controller';
import { GetOrganization } from './usecases/get-organization/get-organization.usecase';
import { UpdateOrganization } from './usecases/update-organization/update-organization.usecase';

const USE_CASES = [GetOrganization, UpdateOrganization];

@Module({
  controllers: [OrganizationController],
  providers: [...USE_CASES],
})
export class OrganizationModule {}

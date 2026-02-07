import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PERMISSIONS_ENUM } from '@boilerplate/core';

import {
  UserSession,
  type UserSessionData,
} from '../shared/decorators/user-session.decorator';
import { RequirePermissions } from '../shared/decorators/require-permissions.decorator';
import { OrganizationResponseDto } from './dtos/organization-response.dto';
import { UpdateOrganizationDto } from './dtos/update-organization.dto';
import { GetOrganization } from './usecases/get-organization/get-organization.usecase';
import { UpdateOrganization } from './usecases/update-organization/update-organization.usecase';
import { UpdateOrganizationCommand } from './usecases/update-organization/update-organization.command';

@ApiTags('Organization')
@Controller('organization')
export class OrganizationController {
  constructor(
    private readonly getOrganization: GetOrganization,
    private readonly updateOrganization: UpdateOrganization,
  ) {}

  @Get()
  @RequirePermissions(PERMISSIONS_ENUM.ORGANIZATION_READ)
  @ApiOperation({ summary: 'Get current organization' })
  @ApiResponse({ status: 200, type: OrganizationResponseDto })
  async get(
    @UserSession() user: UserSessionData,
  ): Promise<OrganizationResponseDto> {
    return this.getOrganization.execute(user.organizationId) as any;
  }

  @Put()
  @RequirePermissions(PERMISSIONS_ENUM.ORGANIZATION_UPDATE)
  @ApiOperation({ summary: 'Update organization settings' })
  @ApiResponse({ status: 200, type: OrganizationResponseDto })
  async update(
    @UserSession() user: UserSessionData,
    @Body() dto: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    return this.updateOrganization.execute(
      UpdateOrganizationCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        name: dto.name,
        domain: dto.domain,
        logoUrl: dto.logoUrl,
      }),
    ) as any;
  }
}

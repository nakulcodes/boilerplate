import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PERMISSIONS_ENUM } from '@boilerplate/core';

import {
  UserSession,
  type UserSessionData,
} from '@shared/decorators/user-session.decorator';
import { RequirePermissions } from '@shared/decorators/require-permissions.decorator';
import { ApiOkPaginatedResponse } from '@shared/decorators/api-ok-paginated-response.decorator';
import { PaginatedResponseDto } from '@shared/dtos/pagination-response';
import { ApplicationResponseDto } from './dtos/application-response.dto';
import { CreateApplicationDto } from './dtos/create-application.dto';
import { UpdateApplicationStatusDto } from './dtos/update-application-status.dto';
import { AssignApplicationDto } from './dtos/assign-application.dto';
import { ListApplicationsDto } from './dtos/list-applications.dto';
import { CreateApplication } from './usecases/create-application/create-application.usecase';
import { CreateApplicationCommand } from './usecases/create-application/create-application.command';
import { UpdateApplicationStatus } from './usecases/update-application-status/update-application-status.usecase';
import { UpdateApplicationStatusCommand } from './usecases/update-application-status/update-application-status.command';
import { AssignApplication } from './usecases/assign-application/assign-application.usecase';
import { AssignApplicationCommand } from './usecases/assign-application/assign-application.command';
import { ListApplications } from './usecases/list-applications/list-applications.usecase';
import { ListApplicationsCommand } from './usecases/list-applications/list-applications.command';
import { GetApplication } from './usecases/get-application/get-application.usecase';
import { GetApplicationCommand } from './usecases/get-application/get-application.command';

@ApiTags('Applications')
@Controller('applications')
export class ApplicationController {
  constructor(
    private readonly createApplication: CreateApplication,
    private readonly updateApplicationStatus: UpdateApplicationStatus,
    private readonly assignApplication: AssignApplication,
    private readonly listApplications: ListApplications,
    private readonly getApplication: GetApplication,
  ) {}

  @Post()
  @RequirePermissions(PERMISSIONS_ENUM.APPLICATION_READ)
  @ApiOperation({ summary: 'Create a new application' })
  @ApiResponse({ status: 201, type: ApplicationResponseDto })
  async create(
    @UserSession() user: UserSessionData,
    @Body() dto: CreateApplicationDto,
  ): Promise<ApplicationResponseDto> {
    return this.createApplication.execute(
      CreateApplicationCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        jobId: dto.jobId,
        candidateId: dto.candidateId,
        customFields: dto.customFields,
      }),
    ) as any;
  }

  @Post('list')
  @RequirePermissions(PERMISSIONS_ENUM.APPLICATION_READ)
  @ApiOperation({ summary: 'List applications' })
  @ApiOkPaginatedResponse(ApplicationResponseDto)
  async list(
    @UserSession() user: UserSessionData,
    @Body() dto: ListApplicationsDto,
  ): Promise<PaginatedResponseDto<ApplicationResponseDto>> {
    return this.listApplications.execute(
      ListApplicationsCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        page: dto.page,
        limit: dto.limit,
        jobId: dto.jobId,
        candidateId: dto.candidateId,
        status: dto.status,
        assignedToId: dto.assignedToId,
      }),
    ) as any;
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS_ENUM.APPLICATION_READ)
  @ApiOperation({ summary: 'Get an application by ID' })
  @ApiResponse({ status: 200, type: ApplicationResponseDto })
  async get(
    @UserSession() user: UserSessionData,
    @Param('id') id: string,
  ): Promise<ApplicationResponseDto> {
    return this.getApplication.execute(
      GetApplicationCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        applicationId: id,
      }),
    ) as any;
  }

  @Post(':id/status')
  @RequirePermissions(PERMISSIONS_ENUM.APPLICATION_UPDATE_STATUS)
  @ApiOperation({ summary: 'Update application status' })
  @ApiResponse({ status: 200, type: ApplicationResponseDto })
  async updateStatus(
    @UserSession() user: UserSessionData,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ): Promise<ApplicationResponseDto> {
    return this.updateApplicationStatus.execute(
      UpdateApplicationStatusCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        applicationId: id,
        status: dto.status,
        rejectionReason: dto.rejectionReason,
      }),
    ) as any;
  }

  @Post(':id/assign')
  @RequirePermissions(PERMISSIONS_ENUM.APPLICATION_ASSIGN)
  @ApiOperation({ summary: 'Assign application to a user' })
  @ApiResponse({ status: 200, type: ApplicationResponseDto })
  async assign(
    @UserSession() user: UserSessionData,
    @Param('id') id: string,
    @Body() dto: AssignApplicationDto,
  ): Promise<ApplicationResponseDto> {
    return this.assignApplication.execute(
      AssignApplicationCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        applicationId: id,
        assignedToId: dto.assignedToId,
      }),
    ) as any;
  }
}

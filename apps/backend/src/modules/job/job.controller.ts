import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PERMISSIONS_ENUM } from '@boilerplate/core';

import {
  UserSession,
  type UserSessionData,
} from '@shared/decorators/user-session.decorator';
import { RequirePermissions } from '@shared/decorators/require-permissions.decorator';
import { ApiOkPaginatedResponse } from '@shared/decorators/api-ok-paginated-response.decorator';
import { PaginatedResponseDto } from '@shared/dtos/pagination-response';
import { JobResponseDto } from './dtos/job-response.dto';
import { CreateJobDto } from './dtos/create-job.dto';
import { UpdateJobDto } from './dtos/update-job.dto';
import { ListJobsDto } from './dtos/list-jobs.dto';
import { CreateJob } from './usecases/create-job/create-job.usecase';
import { CreateJobCommand } from './usecases/create-job/create-job.command';
import { UpdateJob } from './usecases/update-job/update-job.usecase';
import { UpdateJobCommand } from './usecases/update-job/update-job.command';
import { PublishJob } from './usecases/publish-job/publish-job.usecase';
import { PublishJobCommand } from './usecases/publish-job/publish-job.command';
import { CloseJob } from './usecases/close-job/close-job.usecase';
import { CloseJobCommand } from './usecases/close-job/close-job.command';
import { ListJobs } from './usecases/list-jobs/list-jobs.usecase';
import { ListJobsCommand } from './usecases/list-jobs/list-jobs.command';
import { GetJob } from './usecases/get-job/get-job.usecase';
import { GetJobCommand } from './usecases/get-job/get-job.command';

@ApiTags('Jobs')
@Controller('jobs')
export class JobController {
  constructor(
    private readonly createJob: CreateJob,
    private readonly updateJob: UpdateJob,
    private readonly publishJob: PublishJob,
    private readonly closeJob: CloseJob,
    private readonly listJobs: ListJobs,
    private readonly getJob: GetJob,
  ) {}

  @Post()
  @RequirePermissions(PERMISSIONS_ENUM.JOB_CREATE)
  @ApiOperation({ summary: 'Create a new job posting' })
  @ApiResponse({ status: 201, type: JobResponseDto })
  async create(
    @UserSession() user: UserSessionData,
    @Body() dto: CreateJobDto,
  ): Promise<JobResponseDto> {
    return this.createJob.execute(
      CreateJobCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        title: dto.title,
        description: dto.description,
        requirements: dto.requirements,
        department: dto.department,
        location: dto.location,
        locationType: dto.locationType,
        type: dto.type,
        salaryMin: dto.salaryMin,
        salaryMax: dto.salaryMax,
        salaryCurrency: dto.salaryCurrency,
        customFields: dto.customFields,
      }),
    ) as any;
  }

  @Post('list')
  @RequirePermissions(PERMISSIONS_ENUM.JOB_READ)
  @ApiOperation({ summary: 'List job postings' })
  @ApiOkPaginatedResponse(JobResponseDto)
  async list(
    @UserSession() user: UserSessionData,
    @Body() dto: ListJobsDto,
  ): Promise<PaginatedResponseDto<JobResponseDto>> {
    return this.listJobs.execute(
      ListJobsCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        page: dto.page,
        limit: dto.limit,
        status: dto.status,
        search: dto.search,
        department: dto.department,
      }),
    ) as any;
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS_ENUM.JOB_READ)
  @ApiOperation({ summary: 'Get a job by ID' })
  @ApiResponse({ status: 200, type: JobResponseDto })
  async get(
    @UserSession() user: UserSessionData,
    @Param('id') id: string,
  ): Promise<JobResponseDto> {
    return this.getJob.execute(
      GetJobCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        jobId: id,
      }),
    ) as any;
  }

  @Put(':id')
  @RequirePermissions(PERMISSIONS_ENUM.JOB_UPDATE)
  @ApiOperation({ summary: 'Update a job posting' })
  @ApiResponse({ status: 200, type: JobResponseDto })
  async update(
    @UserSession() user: UserSessionData,
    @Param('id') id: string,
    @Body() dto: UpdateJobDto,
  ): Promise<JobResponseDto> {
    return this.updateJob.execute(
      UpdateJobCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        jobId: id,
        title: dto.title,
        description: dto.description,
        requirements: dto.requirements,
        department: dto.department,
        location: dto.location,
        locationType: dto.locationType,
        type: dto.type,
        salaryMin: dto.salaryMin,
        salaryMax: dto.salaryMax,
        salaryCurrency: dto.salaryCurrency,
        customFields: dto.customFields,
      }),
    ) as any;
  }

  @Post(':id/publish')
  @RequirePermissions(PERMISSIONS_ENUM.JOB_PUBLISH)
  @ApiOperation({ summary: 'Publish a draft job' })
  @ApiResponse({ status: 200, type: JobResponseDto })
  async publish(
    @UserSession() user: UserSessionData,
    @Param('id') id: string,
  ): Promise<JobResponseDto> {
    return this.publishJob.execute(
      PublishJobCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        jobId: id,
      }),
    ) as any;
  }

  @Post(':id/close')
  @RequirePermissions(PERMISSIONS_ENUM.JOB_UPDATE)
  @ApiOperation({ summary: 'Close a published job' })
  @ApiResponse({ status: 200, type: JobResponseDto })
  async close(
    @UserSession() user: UserSessionData,
    @Param('id') id: string,
  ): Promise<JobResponseDto> {
    return this.closeJob.execute(
      CloseJobCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        jobId: id,
      }),
    ) as any;
  }
}

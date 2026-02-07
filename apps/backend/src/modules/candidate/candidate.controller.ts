import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PERMISSIONS_ENUM } from '@boilerplate/core';

import {
  UserSession,
  type UserSessionData,
} from '@shared/decorators/user-session.decorator';
import { RequirePermissions } from '@shared/decorators/require-permissions.decorator';
import { ApiOkPaginatedResponse } from '@shared/decorators/api-ok-paginated-response.decorator';
import { PaginatedResponseDto } from '@shared/dtos/pagination-response';
import { CandidateResponseDto } from './dtos/candidate-response.dto';
import { CreateCandidateDto } from './dtos/create-candidate.dto';
import { UpdateCandidateDto } from './dtos/update-candidate.dto';
import { ListCandidatesDto } from './dtos/list-candidates.dto';
import { CreateCandidate } from './usecases/create-candidate/create-candidate.usecase';
import { CreateCandidateCommand } from './usecases/create-candidate/create-candidate.command';
import { UpdateCandidate } from './usecases/update-candidate/update-candidate.usecase';
import { UpdateCandidateCommand } from './usecases/update-candidate/update-candidate.command';
import { ListCandidates } from './usecases/list-candidates/list-candidates.usecase';
import { ListCandidatesCommand } from './usecases/list-candidates/list-candidates.command';
import { GetCandidate } from './usecases/get-candidate/get-candidate.usecase';
import { GetCandidateCommand } from './usecases/get-candidate/get-candidate.command';

@ApiTags('Candidates')
@Controller('candidates')
export class CandidateController {
  constructor(
    private readonly createCandidate: CreateCandidate,
    private readonly updateCandidate: UpdateCandidate,
    private readonly listCandidates: ListCandidates,
    private readonly getCandidate: GetCandidate,
  ) {}

  @Post()
  @RequirePermissions(PERMISSIONS_ENUM.CANDIDATE_CREATE)
  @ApiOperation({ summary: 'Create a new candidate' })
  @ApiResponse({ status: 201, type: CandidateResponseDto })
  async create(
    @UserSession() user: UserSessionData,
    @Body() dto: CreateCandidateDto,
  ): Promise<CandidateResponseDto> {
    return this.createCandidate.execute(
      CreateCandidateCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        linkedinUrl: dto.linkedinUrl,
        portfolioUrl: dto.portfolioUrl,
        currentCompany: dto.currentCompany,
        currentTitle: dto.currentTitle,
        source: dto.source,
        notes: dto.notes,
        customFields: dto.customFields,
      }),
    ) as any;
  }

  @Post('list')
  @RequirePermissions(PERMISSIONS_ENUM.CANDIDATE_READ)
  @ApiOperation({ summary: 'List candidates' })
  @ApiOkPaginatedResponse(CandidateResponseDto)
  async list(
    @UserSession() user: UserSessionData,
    @Body() dto: ListCandidatesDto,
  ): Promise<PaginatedResponseDto<CandidateResponseDto>> {
    return this.listCandidates.execute(
      ListCandidatesCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        page: dto.page,
        limit: dto.limit,
        search: dto.search,
        source: dto.source,
      }),
    ) as any;
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS_ENUM.CANDIDATE_READ)
  @ApiOperation({ summary: 'Get a candidate by ID' })
  @ApiResponse({ status: 200, type: CandidateResponseDto })
  async get(
    @UserSession() user: UserSessionData,
    @Param('id') id: string,
  ): Promise<CandidateResponseDto> {
    return this.getCandidate.execute(
      GetCandidateCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        candidateId: id,
      }),
    ) as any;
  }

  @Put(':id')
  @RequirePermissions(PERMISSIONS_ENUM.CANDIDATE_UPDATE)
  @ApiOperation({ summary: 'Update a candidate' })
  @ApiResponse({ status: 200, type: CandidateResponseDto })
  async update(
    @UserSession() user: UserSessionData,
    @Param('id') id: string,
    @Body() dto: UpdateCandidateDto,
  ): Promise<CandidateResponseDto> {
    return this.updateCandidate.execute(
      UpdateCandidateCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        candidateId: id,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        linkedinUrl: dto.linkedinUrl,
        portfolioUrl: dto.portfolioUrl,
        currentCompany: dto.currentCompany,
        currentTitle: dto.currentTitle,
        source: dto.source,
        notes: dto.notes,
        customFields: dto.customFields,
      }),
    ) as any;
  }
}

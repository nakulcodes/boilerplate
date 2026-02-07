import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PERMISSIONS_ENUM } from '@boilerplate/core';

import {
  UserSession,
  type UserSessionData,
} from '@shared/decorators/user-session.decorator';
import { RequirePermissions } from '@shared/decorators/require-permissions.decorator';
import { ApiOkPaginatedResponse } from '@shared/decorators/api-ok-paginated-response.decorator';
import { PaginatedResponseDto } from '@shared/dtos/pagination-response';
import { TimelineResponseDto } from './dtos/timeline-response.dto';
import { ListTimelineDto } from './dtos/list-timeline.dto';
import { CreateTimelineEventDto } from './dtos/create-timeline-event.dto';
import { ListTimeline } from './usecases/list-timeline/list-timeline.usecase';
import { ListTimelineCommand } from './usecases/list-timeline/list-timeline.command';
import { CreateTimelineEvent } from './usecases/create-timeline-event/create-timeline-event.usecase';
import { CreateTimelineEventCommand } from './usecases/create-timeline-event/create-timeline-event.command';

@ApiTags('Timeline')
@Controller('timeline')
export class TimelineController {
  constructor(
    private readonly listTimeline: ListTimeline,
    private readonly createTimelineEvent: CreateTimelineEvent,
  ) {}

  @Post('list')
  @RequirePermissions(PERMISSIONS_ENUM.TIMELINE_READ)
  @ApiOperation({ summary: 'List timeline events for an entity' })
  @ApiOkPaginatedResponse(TimelineResponseDto)
  async list(
    @UserSession() user: UserSessionData,
    @Body() dto: ListTimelineDto,
  ): Promise<PaginatedResponseDto<TimelineResponseDto>> {
    return this.listTimeline.execute(
      ListTimelineCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        page: dto.page,
        limit: dto.limit,
        entityType: dto.entityType,
        entityId: dto.entityId,
        eventType: dto.eventType,
      }),
    ) as any;
  }

  @Post()
  @RequirePermissions(PERMISSIONS_ENUM.TIMELINE_READ)
  @ApiOperation({ summary: 'Create a timeline event' })
  @ApiResponse({ status: 201, type: TimelineResponseDto })
  async create(
    @UserSession() user: UserSessionData,
    @Body() dto: CreateTimelineEventDto,
  ): Promise<TimelineResponseDto> {
    return this.createTimelineEvent.execute(
      CreateTimelineEventCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        entityType: dto.entityType,
        entityId: dto.entityId,
        eventType: dto.eventType,
        title: dto.title,
        description: dto.description,
        metadata: dto.metadata,
        isPublic: dto.isPublic,
      }),
    ) as any;
  }
}

import { Injectable } from '@nestjs/common';
import { calculateSkip, createPaginationMetadata } from '@boilerplate/core';
import { TimelineRepository } from '@db/repositories';
import { ListTimelineCommand } from './list-timeline.command';

@Injectable()
export class ListTimeline {
  constructor(private readonly timelineRepository: TimelineRepository) {}

  async execute(command: ListTimelineCommand) {
    const skip = calculateSkip(command.page, command.limit);

    const queryBuilder = this.timelineRepository
      .createQueryBuilder('timeline')
      .leftJoin('timeline.actor', 'actor')
      .where('timeline.organizationId = :organizationId', {
        organizationId: command.organizationId,
      })
      .andWhere('timeline.entityType = :entityType', {
        entityType: command.entityType,
      })
      .andWhere('timeline.entityId = :entityId', {
        entityId: command.entityId,
      })
      .select([
        'timeline.id',
        'timeline.organizationId',
        'timeline.actorId',
        'timeline.entityType',
        'timeline.entityId',
        'timeline.eventType',
        'timeline.title',
        'timeline.description',
        'timeline.metadata',
        'timeline.isPublic',
        'timeline.createdAt',
        'actor.id',
        'actor.firstName',
        'actor.lastName',
        'actor.email',
      ]);

    if (command.eventType) {
      queryBuilder.andWhere('timeline.eventType = :eventType', {
        eventType: command.eventType,
      });
    }

    queryBuilder
      .orderBy('timeline.createdAt', 'DESC')
      .skip(skip)
      .take(command.limit);

    const [events, total] = await queryBuilder.getManyAndCount();

    return {
      data: events,
      ...createPaginationMetadata(command.page, command.limit, total),
    };
  }
}

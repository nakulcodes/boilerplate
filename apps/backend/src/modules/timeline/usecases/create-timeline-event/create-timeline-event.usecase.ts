import { Injectable } from '@nestjs/common';
import { TimelineRepository } from '@db/repositories';
import { TimelineEntity } from '@db/entities';
import { CreateTimelineEventCommand } from './create-timeline-event.command';

@Injectable()
export class CreateTimelineEvent {
  constructor(private readonly timelineRepository: TimelineRepository) {}

  async execute(command: CreateTimelineEventCommand): Promise<TimelineEntity> {
    const timelineEvent = this.timelineRepository.create({
      organizationId: command.organizationId,
      actorId: command.userId,
      entityType: command.entityType,
      entityId: command.entityId,
      eventType: command.eventType,
      title: command.title,
      description: command.description ?? null,
      metadata: command.metadata ?? null,
      isPublic: command.isPublic ?? false,
    });

    return this.timelineRepository.save(timelineEvent);
  }
}

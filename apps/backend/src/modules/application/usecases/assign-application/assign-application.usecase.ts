import { Injectable, NotFoundException } from '@nestjs/common';
import { ApplicationRepository, UserRepository } from '@db/repositories';
import { ApplicationEntity } from '@db/entities';
import { EventName, ApplicationAssignedEvent } from '@boilerplate/core';
import { AppEventEmitter } from '@modules/events/services/event-emitter.service';
import { AssignApplicationCommand } from './assign-application.command';

@Injectable()
export class AssignApplication {
  constructor(
    private readonly applicationRepository: ApplicationRepository,
    private readonly userRepository: UserRepository,
    private readonly eventEmitter: AppEventEmitter,
  ) {}

  async execute(command: AssignApplicationCommand): Promise<ApplicationEntity> {
    const application = await this.applicationRepository.findByIdAndOrg(
      command.applicationId,
      command.organizationId,
    );

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const assignee = await this.userRepository.findOne({
      where: {
        id: command.assignedToId,
        organizationId: command.organizationId,
      },
    });

    if (!assignee) {
      throw new NotFoundException('Assignee not found');
    }

    const previousAssigneeId = application.assignedToId;
    application.assignedToId = command.assignedToId;

    const savedApplication = await this.applicationRepository.save(application);

    this.eventEmitter.emit<ApplicationAssignedEvent>({
      eventName: EventName.APPLICATION_ASSIGNED,
      applicationId: application.id,
      organizationId: command.organizationId,
      assigneeId: command.assignedToId,
      previousAssigneeId,
      actorId: command.userId,
      timestamp: new Date(),
    });

    return savedApplication;
  }
}

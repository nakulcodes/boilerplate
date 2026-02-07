import { Injectable, NotFoundException } from '@nestjs/common';
import { ApplicationRepository } from '@db/repositories';
import { ApplicationEntity } from '@db/entities';
import { ApplicationStatus } from '@db/enums';
import { EventName, ApplicationStatusChangedEvent } from '@boilerplate/core';
import { AppEventEmitter } from '@modules/events/services/event-emitter.service';
import { UpdateApplicationStatusCommand } from './update-application-status.command';

@Injectable()
export class UpdateApplicationStatus {
  constructor(
    private readonly applicationRepository: ApplicationRepository,
    private readonly eventEmitter: AppEventEmitter,
  ) {}

  async execute(
    command: UpdateApplicationStatusCommand,
  ): Promise<ApplicationEntity> {
    const application = await this.applicationRepository.findByIdAndOrg(
      command.applicationId,
      command.organizationId,
    );

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const previousStatus = application.status;
    application.status = command.status;

    if (command.status === ApplicationStatus.REJECTED) {
      application.rejectionReason = command.rejectionReason ?? null;
    }

    const savedApplication = await this.applicationRepository.save(application);

    this.eventEmitter.emit<ApplicationStatusChangedEvent>({
      eventName: EventName.APPLICATION_STATUS_CHANGED,
      applicationId: application.id,
      organizationId: command.organizationId,
      previousStatus,
      newStatus: command.status,
      actorId: command.userId,
      rejectionReason: command.rejectionReason,
      timestamp: new Date(),
    });

    return savedApplication;
  }
}

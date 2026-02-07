import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventName, ApplicationStatus } from '@boilerplate/core';
import type {
  ApplicationCreatedEvent,
  ApplicationStatusChangedEvent,
  ApplicationAssignedEvent,
} from '@boilerplate/core';
import {
  ApplicationRepository,
  UserRepository,
  TimelineRepository,
} from '@db/repositories';

@Injectable()
export class TimelineListener {
  private readonly logger = new Logger(TimelineListener.name);

  constructor(
    private readonly applicationRepository: ApplicationRepository,
    private readonly userRepository: UserRepository,
    private readonly timelineRepository: TimelineRepository,
  ) {}

  @OnEvent(EventName.APPLICATION_CREATED, { async: true })
  async handleApplicationCreated(
    event: ApplicationCreatedEvent,
  ): Promise<void> {
    try {
      const application = await this.applicationRepository.findOne({
        where: { id: event.applicationId },
        relations: { job: true, candidate: true },
      });

      if (!application) {
        this.logger.warn(
          `Application ${event.applicationId} not found for timeline event`,
        );
        return;
      }

      const timelineEvent = this.timelineRepository.create({
        organizationId: event.organizationId,
        actorId: event.actorId,
        entityType: 'application',
        entityId: event.applicationId,
        eventType: 'created',
        title: 'Application submitted',
        metadata: {
          jobId: application.jobId,
          jobTitle: application.job?.title,
          candidateId: application.candidateId,
          candidateName: application.candidate
            ? `${application.candidate.firstName} ${application.candidate.lastName}`
            : null,
        },
        isPublic: true,
      });

      await this.timelineRepository.save(timelineEvent);
      this.logger.log(
        `Timeline event created for application ${event.applicationId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create timeline event for application ${event.applicationId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  @OnEvent(EventName.APPLICATION_STATUS_CHANGED, { async: true })
  async handleApplicationStatusChanged(
    event: ApplicationStatusChangedEvent,
  ): Promise<void> {
    try {
      const timelineEvent = this.timelineRepository.create({
        organizationId: event.organizationId,
        actorId: event.actorId,
        entityType: 'application',
        entityId: event.applicationId,
        eventType: 'status_changed',
        title: `Status changed to ${this.formatStatus(event.newStatus)}`,
        metadata: {
          from: event.previousStatus,
          to: event.newStatus,
          rejectionReason: event.rejectionReason,
        },
        isPublic: event.newStatus !== ApplicationStatus.REJECTED,
      });

      await this.timelineRepository.save(timelineEvent);
      this.logger.log(
        `Timeline event created for application status change ${event.applicationId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create timeline event for application status change ${event.applicationId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  @OnEvent(EventName.APPLICATION_ASSIGNED, { async: true })
  async handleApplicationAssigned(
    event: ApplicationAssignedEvent,
  ): Promise<void> {
    try {
      const assignee = await this.userRepository.findOne({
        where: { id: event.assigneeId },
      });

      if (!assignee) {
        this.logger.warn(
          `Assignee ${event.assigneeId} not found for timeline event`,
        );
        return;
      }

      const assigneeName =
        [assignee.firstName, assignee.lastName].filter(Boolean).join(' ') ||
        assignee.email;

      const timelineEvent = this.timelineRepository.create({
        organizationId: event.organizationId,
        actorId: event.actorId,
        entityType: 'application',
        entityId: event.applicationId,
        eventType: 'assigned',
        title: `Assigned to ${assigneeName}`,
        metadata: {
          previousAssigneeId: event.previousAssigneeId,
          newAssigneeId: event.assigneeId,
          newAssigneeName: assigneeName,
        },
        isPublic: false,
      });

      await this.timelineRepository.save(timelineEvent);
      this.logger.log(
        `Timeline event created for application assignment ${event.applicationId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create timeline event for application assignment ${event.applicationId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  private formatStatus(status: ApplicationStatus): string {
    return status
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

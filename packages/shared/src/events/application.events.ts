import { BaseEvent } from './base.event';
import { EventName } from './event-names';
import { ApplicationStatus } from '../enums';

export interface ApplicationCreatedEvent extends BaseEvent {
  eventName: EventName.APPLICATION_CREATED;
  applicationId: string;
  organizationId: string;
  actorId: string;
}

export interface ApplicationStatusChangedEvent extends BaseEvent {
  eventName: EventName.APPLICATION_STATUS_CHANGED;
  applicationId: string;
  organizationId: string;
  previousStatus: ApplicationStatus;
  newStatus: ApplicationStatus;
  actorId: string;
  rejectionReason?: string;
}

export interface ApplicationAssignedEvent extends BaseEvent {
  eventName: EventName.APPLICATION_ASSIGNED;
  applicationId: string;
  organizationId: string;
  assigneeId: string;
  previousAssigneeId: string | null;
  actorId: string;
}

export type ApplicationEvent =
  | ApplicationCreatedEvent
  | ApplicationStatusChangedEvent
  | ApplicationAssignedEvent;

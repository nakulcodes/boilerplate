import { BaseEvent } from './base.event';
import { EventName } from './event-names';

export interface OrganizationCreatedEvent extends BaseEvent {
  eventName: EventName.ORGANIZATION_CREATED;
  organizationId: string;
  createdBy: string;
}

export type OrganizationEvent = OrganizationCreatedEvent;

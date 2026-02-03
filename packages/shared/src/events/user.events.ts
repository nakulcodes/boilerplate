import { BaseEvent } from './base.event';
import { EventName } from './event-names';

export interface UserRegisteredEvent extends BaseEvent {
  eventName: EventName.USER_REGISTERED;
  userId: string;
  organizationId: string;
}

export interface UserInvitedEvent extends BaseEvent {
  eventName: EventName.USER_INVITED;
  userId: string;
  organizationId: string;
  invitedBy: string;
  inviteLink: string;
}

export interface UserInviteResentEvent extends BaseEvent {
  eventName: EventName.USER_INVITE_RESENT;
  userId: string;
  organizationId: string;
  inviteLink: string;
}

export interface UserInviteAcceptedEvent extends BaseEvent {
  eventName: EventName.USER_INVITE_ACCEPTED;
  userId: string;
  organizationId: string;
}

export interface UserCreatedEvent extends BaseEvent {
  eventName: EventName.USER_CREATED;
  userId: string;
  organizationId: string;
  createdBy: string;
  generatedPassword?: string;
}

export interface UserBlockedEvent extends BaseEvent {
  eventName: EventName.USER_BLOCKED;
  userId: string;
  organizationId: string;
  blockedBy: string;
}

export interface UserUnblockedEvent extends BaseEvent {
  eventName: EventName.USER_UNBLOCKED;
  userId: string;
  organizationId: string;
  unblockedBy: string;
}

export interface UserPasswordResetRequestedEvent extends BaseEvent {
  eventName: EventName.USER_PASSWORD_RESET_REQUESTED;
  userId: string;
  resetLink: string;
}

export interface UserPasswordResetEvent extends BaseEvent {
  eventName: EventName.USER_PASSWORD_RESET;
  userId: string;
}

export interface UserPasswordUpdatedEvent extends BaseEvent {
  eventName: EventName.USER_PASSWORD_UPDATED;
  userId: string;
}

export interface UserLoggedInEvent extends BaseEvent {
  eventName: EventName.USER_LOGGED_IN;
  userId: string;
  organizationId: string;
}

export interface UserLoggedOutEvent extends BaseEvent {
  eventName: EventName.USER_LOGGED_OUT;
  userId: string;
  organizationId: string;
}

export type UserEvent =
  | UserRegisteredEvent
  | UserInvitedEvent
  | UserInviteResentEvent
  | UserInviteAcceptedEvent
  | UserCreatedEvent
  | UserBlockedEvent
  | UserUnblockedEvent
  | UserPasswordResetRequestedEvent
  | UserPasswordResetEvent
  | UserPasswordUpdatedEvent
  | UserLoggedInEvent
  | UserLoggedOutEvent;

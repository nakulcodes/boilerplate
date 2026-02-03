import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import {
  MailService,
  buildUserInviteEmail,
  buildPasswordResetEmail,
  buildWelcomeEmail,
  EventName,
} from '@boilerplate/core';
import * as Events from '@boilerplate/core';
import { UserRepository } from '../../../database/repositories';

@Injectable()
export class UserEmailListener {
  private readonly logger = new Logger(UserEmailListener.name);

  constructor(
    private readonly mailService: MailService,
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  @OnEvent(EventName.USER_INVITED, { async: true })
  async handleUserInvited(event: Events.UserInvitedEvent): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: event.userId },
        relations: { organization: true, inviter: true },
      });

      if (!user) {
        this.logger.warn(`User ${event.userId} not found for invitation email`);
        return;
      }

      const inviterName = user.inviter
        ? `${user.inviter.firstName || ''} ${user.inviter.lastName || ''}`.trim() ||
          user.inviter.email
        : 'Someone';

      const email = buildUserInviteEmail({
        userName: user.firstName || user.email.split('@')[0],
        inviterName,
        organizationName: user.organization?.name || 'the platform',
        inviteLink: event.inviteLink,
        email: user.email,
        expiryHours: 24,
      });

      await this.mailService.sendEmail({
        to: user.email,
        subject: email.subject,
        text: email.text,
        html: email.html,
      });

      this.logger.log(`Invitation email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send invitation email for user ${event.userId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  @OnEvent(EventName.USER_INVITE_RESENT, { async: true })
  async handleUserInviteResent(
    event: Events.UserInviteResentEvent,
  ): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: event.userId },
        relations: { organization: true, inviter: true },
      });

      if (!user) {
        this.logger.warn(
          `User ${event.userId} not found for resend invite email`,
        );
        return;
      }

      const inviterName = user.inviter
        ? `${user.inviter.firstName || ''} ${user.inviter.lastName || ''}`.trim() ||
          user.inviter.email
        : 'Someone';

      const email = buildUserInviteEmail({
        userName: user.firstName || user.email.split('@')[0],
        inviterName,
        organizationName: user.organization?.name || 'the platform',
        inviteLink: event.inviteLink,
        email: user.email,
        expiryHours: 24,
      });

      await this.mailService.sendEmail({
        to: user.email,
        subject: email.subject,
        text: email.text,
        html: email.html,
      });

      this.logger.log(`Resend invitation email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to resend invitation email for user ${event.userId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  @OnEvent(EventName.USER_INVITE_ACCEPTED, { async: true })
  async handleUserInviteAccepted(
    event: Events.UserInviteAcceptedEvent,
  ): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: event.userId },
        relations: { organization: true },
      });

      if (!user) {
        this.logger.warn(`User ${event.userId} not found for welcome email`);
        return;
      }

      const frontendUrl = this.configService.get<string>('FRONTEND_BASE_URL');

      const email = buildWelcomeEmail({
        userName: user.firstName || user.email.split('@')[0],
        organizationName: user.organization?.name || 'the platform',
        loginUrl: frontendUrl ? `${frontendUrl}/login` : undefined,
      });

      await this.mailService.sendEmail({
        to: user.email,
        subject: email.subject,
        text: email.text,
        html: email.html,
      });

      this.logger.log(`Welcome email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email for user ${event.userId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  @OnEvent(EventName.USER_REGISTERED, { async: true })
  async handleUserRegistered(event: Events.UserRegisteredEvent): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: event.userId },
        relations: { organization: true },
      });

      if (!user) {
        this.logger.warn(`User ${event.userId} not found for welcome email`);
        return;
      }

      const frontendUrl = this.configService.get<string>('FRONTEND_BASE_URL');

      const email = buildWelcomeEmail({
        userName: user.firstName || user.email.split('@')[0],
        organizationName: user.organization?.name || 'the platform',
        loginUrl: frontendUrl ? `${frontendUrl}/login` : undefined,
      });

      await this.mailService.sendEmail({
        to: user.email,
        subject: email.subject,
        text: email.text,
        html: email.html,
      });

      this.logger.log(
        `Welcome email sent to newly registered user ${user.email}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email for user ${event.userId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  @OnEvent(EventName.USER_PASSWORD_RESET_REQUESTED, { async: true })
  async handlePasswordResetRequested(
    event: Events.UserPasswordResetRequestedEvent,
  ): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: event.userId },
        relations: { organization: true },
      });

      if (!user) {
        this.logger.warn(
          `User ${event.userId} not found for password reset email`,
        );
        return;
      }

      const email = buildPasswordResetEmail({
        userName:
          `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
          user.email.split('@')[0],
        organizationName: user.organization?.name || 'the platform',
        resetLink: event.resetLink,
        expiryHours: 1,
      });

      await this.mailService.sendEmail({
        to: user.email,
        subject: email.subject,
        text: email.text,
        html: email.html,
      });

      this.logger.log(`Password reset email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email for user ${event.userId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }
}

import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

import {
  OrganizationRepository,
  UserRepository,
  RoleRepository,
} from '../../../../database/repositories';
import { UserStatus } from '../../../../database/enums';
import { validateEmailDomain } from '@boilerplate/core';
import { AuthService } from '../../../auth/services/auth.service';

import { CreateUserCommand } from './create-user.command';

export interface CreateUserResult {
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  generatedPassword: string | null;
}

@Injectable()
export class CreateUser {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly roleRepository: RoleRepository,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: CreateUserCommand): Promise<CreateUserResult> {
    const organization = await this.organizationRepository.findById(
      command.organizationId,
    );
    if (!organization) {
      throw new BadRequestException('Organization not found');
    }

    const isValidDomain = validateEmailDomain(
      command.email,
      organization.domain,
    );

    if (
      !isValidDomain &&
      this.configService.get<string>('NODE_ENV') !== 'development'
    ) {
      throw new BadRequestException(
        `Email domain must match organization domain: ${organization.domain}`,
      );
    }

    const existingUser = await this.userRepository.findOne({
      where: {
        email: command.email.toLowerCase(),
        organizationId: command.organizationId,
      },
    });
    if (existingUser) {
      throw new ConflictException(
        'User with this email already exists in this organization',
      );
    }

    if (command.roleId) {
      const role = await this.roleRepository.findOne({
        where: { id: command.roleId, organizationId: command.organizationId },
      });
      if (!role) {
        throw new BadRequestException('Role not found in this organization');
      }
    }

    const generatedPassword = command.password
      ? null
      : this.generateRandomPassword();
    const passwordToHash = command.password || generatedPassword!;
    const hashedPassword = await this.authService.hashPassword(passwordToHash);

    const user = this.userRepository.create({
      email: command.email.toLowerCase(),
      password: hashedPassword,
      firstName: command.firstName || null,
      lastName: command.lastName || null,
      organizationId: command.organizationId,
      invitedBy: command.createdBy,
      roleId: command.roleId || null,
      status: UserStatus.ACTIVE,
      isActive: true,
      onboarded: true,
      inviteToken: null,
      inviteExpires: null,
    });

    const savedUser = await this.userRepository.save(user);

    return {
      userId: savedUser.id,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      generatedPassword,
    };
  }

  private generateRandomPassword(): string {
    const length = 16;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    const bytes = randomBytes(length);
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset[bytes[i] % charset.length];
    }
    return password;
  }
}

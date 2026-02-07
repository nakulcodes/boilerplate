import { BadRequestException, Injectable } from '@nestjs/common';
import { ALL_PERMISSIONS } from '@boilerplate/core';
import {
  EventName,
  UserRegisteredEvent,
  OrganizationCreatedEvent,
} from '@boilerplate/core';
import {
  OrganizationRepository,
  UserRepository,
  RoleRepository,
} from '@db/repositories';
import { AuthService } from '../../services/auth.service';
import { AppEventEmitter } from '@modules/events/services/event-emitter.service';
import { UserRegisterCommand } from './user-register.command';
import { RegisterResponseDto } from '../../dtos/auth-response.dto';

@Injectable()
export class UserRegister {
  constructor(
    private readonly authService: AuthService,
    private readonly userRepository: UserRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly roleRepository: RoleRepository,
    private readonly eventEmitter: AppEventEmitter,
  ) {}

  async execute(command: UserRegisterCommand): Promise<RegisterResponseDto> {
    const email = command.email.toLowerCase().trim();
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const passwordHash = await this.authService.hashPassword(command.password);

    const organization = this.organizationRepository.create({
      name: command.organizationName || `${command.firstName}'s Organization`,
    });
    await this.organizationRepository.save(organization);

    const adminRole = this.roleRepository.create({
      name: 'Admin',
      permissions: ALL_PERMISSIONS,
      organizationId: organization.id,
      isDefault: true,
    });
    const defaultRole = await this.roleRepository.save(adminRole);

    const user = this.userRepository.create({
      email,
      firstName: command.firstName,
      lastName: command.lastName || null,
      password: passwordHash,
      organizationId: organization.id,
      roleId: defaultRole.id,
      isActive: true,
    });
    const savedUser = await this.userRepository.save(user);

    this.eventEmitter.emit<OrganizationCreatedEvent>({
      eventName: EventName.ORGANIZATION_CREATED,
      timestamp: new Date(),
      organizationId: organization.id,
      createdBy: savedUser.id,
      triggeredBy: savedUser.id,
    });

    this.eventEmitter.emit<UserRegisteredEvent>({
      eventName: EventName.USER_REGISTERED,
      timestamp: new Date(),
      userId: savedUser.id,
      organizationId: savedUser.organizationId,
      triggeredBy: savedUser.id,
    });

    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName ?? '',
        lastName: savedUser.lastName ?? '',
        organizationId: savedUser.organizationId,
      },
      organization: {
        id: organization.id,
        name: organization.name,
      },
    };
  }
}

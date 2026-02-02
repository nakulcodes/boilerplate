import { BadRequestException, Injectable } from '@nestjs/common';
import { ALL_PERMISSIONS } from '@boilerplate/core';
import { OrganizationRepository, UserRepository, RoleRepository } from '../../../../database/repositories';
import { AuthService } from '../../services/auth.service';
import { UserRegisterCommand } from './user-register.command';
import { RegisterResponseDto } from '../../dtos/auth-response.dto';

@Injectable()
export class UserRegister {
  constructor(
    private readonly authService: AuthService,
    private readonly userRepository: UserRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(command: UserRegisterCommand): Promise<RegisterResponseDto> {
    // Check if user already exists
    const email = command.email.toLowerCase().trim();
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Hash password
    const passwordHash = await this.authService.hashPassword(command.password);

    // Create organization
    const organization = this.organizationRepository.create({
      name: command.organizationName || `${command.firstName}'s Organization`,
    });
    await this.organizationRepository.save(organization);

    // Create default Admin role for the organization
    const adminRole = this.roleRepository.create({
      name: 'Admin',
      permissions: ALL_PERMISSIONS,
      organizationId: organization.id,
      isDefault: true,
    });
    await this.roleRepository.save(adminRole);

    // Create user with Admin role
    const user = this.userRepository.create({
      email,
      firstName: command.firstName,
      lastName: command.lastName || null,
      password: passwordHash,
      organizationId: organization.id,
      roleId: adminRole.id,
      isActive: true,
    });
    const savedUser = await this.userRepository.save(user);

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

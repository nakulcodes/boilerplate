import { BadRequestException, Injectable } from '@nestjs/common';
import {
  OrganizationRepository,
  UserRepository,
  RoleRepository,
} from '../../../../database/repositories';
import { DatabaseSeederService } from '../../../../database/seeders/database-seeder.service';
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
    private readonly databaseSeederService: DatabaseSeederService,
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

    await this.databaseSeederService.seedOrganizationDefaults(organization.id);
    const defaultRole = await this.roleRepository.findDefaultRole(
      organization.id,
    );

    const user = this.userRepository.create({
      email,
      firstName: command.firstName,
      lastName: command.lastName || null,
      password: passwordHash,
      organizationId: organization.id,
      roleId: defaultRole?.id ?? null,
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

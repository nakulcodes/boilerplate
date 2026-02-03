import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UserRepository } from '../../../../database/repositories';
import { UserStatus } from '../../../../database/enums';
import {
  buildUrl,
  calculateSkip,
  calculatePaginationMetadata,
  getPermissionScope,
} from '@boilerplate/core';

import { ListUsersCommand } from './list-users.command';

@Injectable()
export class ListUsers {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: ListUsersCommand) {
    const skip = calculateSkip(command.page, command.limit);

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.organization', 'organization')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.inviter', 'inviter')
      .where('user.organizationId = :organizationId', {
        organizationId: command.organizationId,
      })
      .select([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.status',
        'user.isActive',
        'user.onboarded',
        'user.organizationId',
        'user.createdAt',
        'user.updatedAt',
        'user.invitedBy',
        'user.roleId',
        'user.inviteToken',
        'user.inviteExpires',
        'role.id',
        'role.name',
        'organization.id',
        'organization.name',
        'inviter.id',
        'inviter.firstName',
        'inviter.lastName',
        'inviter.email',
      ]);

    // Apply filters
    if (command.status) {
      queryBuilder.andWhere('user.status = :status', {
        status: command.status,
      });
    }

    if (command.search) {
      queryBuilder.andWhere(
        '(user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search: `%${command.search}%` },
      );
    }

    if (command.invitedBy) {
      queryBuilder.andWhere('user.invitedBy = :invitedBy', {
        invitedBy: command.invitedBy,
      });
    }

    // Apply scope filtering based on permissions
    if (command.permissions) {
      const scope = getPermissionScope(command.permissions, 'user:list:read');
      if (scope === 'own') {
        queryBuilder.andWhere('user.invitedBy = :currentUserId', {
          currentUserId: command.userId,
        });
      } else if (scope === 'team' && command.userRoleId) {
        queryBuilder.andWhere('user.roleId = :userRoleId', {
          userRoleId: command.userRoleId,
        });
      }
      // scope === 'all' or null means no additional filtering
    }

    // Pagination
    queryBuilder.skip(skip).take(command.limit);

    // Ordering
    queryBuilder.orderBy('user.createdAt', 'DESC');

    const [users, total] = await queryBuilder.getManyAndCount();

    const frontendBaseUrl = this.configService.get<string>('FRONTEND_BASE_URL');
    const usersWithInviteLinks = users.map((user) => {
      const inviteLink =
        user.status === UserStatus.INVITED && user.inviteToken
          ? buildUrl(
              frontendBaseUrl,
              `/accept-invite?token=${user.inviteToken}`,
            )
          : null;

      return {
        ...user,
        inviteLink,
        inviteExpires: user.inviteExpires || null,
      };
    });

    return {
      data: usersWithInviteLinks,
      ...calculatePaginationMetadata(command.page, command.limit, total),
    };
  }
}

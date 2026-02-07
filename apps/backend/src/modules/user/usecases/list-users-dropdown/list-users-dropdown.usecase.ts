import { Injectable } from '@nestjs/common';
import { createPaginationMetadata, calculateSkip } from '@boilerplate/core';
import { UserRepository } from '@db/repositories';
import { ListUsersDropdownCommand } from './list-users-dropdown.command';
import { UserDropdownResponseDto } from '../../dtos/user-dropdown.dto';
import { PaginatedResponseDto } from '@shared/dtos/pagination-response';

@Injectable()
export class ListUsersDropdown {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    command: ListUsersDropdownCommand,
  ): Promise<
    UserDropdownResponseDto[] | PaginatedResponseDto<UserDropdownResponseDto>
  > {
    const validFields = command.fields.filter((f) =>
      ListUsersDropdownCommand.ALLOWED_FIELDS.includes(f),
    );

    if (!validFields.includes('id')) {
      validFields.unshift('id');
    }

    const includeRole = validFields.includes('role');
    const userFields = validFields.filter((f) => f !== 'role') as Array<
      'id' | 'firstName' | 'lastName' | 'email'
    >;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .where('user.organizationId = :organizationId', {
        organizationId: command.organizationId,
      });

    if (command.search) {
      queryBuilder.andWhere(
        '(LOWER(user.firstName) LIKE LOWER(:search) OR LOWER(user.lastName) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search))',
        { search: `%${command.search}%` },
      );
    }

    const selectFields = userFields.map((f) => `user.${f}`);

    if (includeRole) {
      queryBuilder.leftJoinAndSelect('user.role', 'role');
      selectFields.push('role.id', 'role.name');
    }

    queryBuilder.select(selectFields);
    queryBuilder.orderBy('user.firstName', 'ASC');
    queryBuilder.addOrderBy('user.lastName', 'ASC');

    if (command.paginate) {
      const page = command.page || 1;
      const limit = command.limit || 10;

      const total = await queryBuilder.getCount();

      queryBuilder.skip(calculateSkip(page, limit));
      queryBuilder.take(limit);

      const users = await queryBuilder.getMany();
      const data = this.mapUsers(users, userFields, includeRole);

      return {
        data,
        ...createPaginationMetadata(page, limit, total),
      };
    }

    const users = await queryBuilder.getMany();
    return this.mapUsers(users, userFields, includeRole);
  }

  private mapUsers(
    users: any[],
    userFields: string[],
    includeRole: boolean,
  ): UserDropdownResponseDto[] {
    return users.map((user) => {
      const result: UserDropdownResponseDto = { id: user.id };

      if (userFields.includes('firstName')) {
        result.firstName = user.firstName;
      }
      if (userFields.includes('lastName')) {
        result.lastName = user.lastName;
      }
      if (userFields.includes('email')) {
        result.email = user.email;
      }
      if (includeRole && user.role) {
        result.role = { id: user.role.id, name: user.role.name };
      }

      return result;
    });
  }
}

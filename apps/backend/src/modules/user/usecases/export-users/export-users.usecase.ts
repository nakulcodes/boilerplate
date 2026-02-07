import { Injectable } from '@nestjs/common';
import { ExportService, ExportColumn } from '@boilerplate/core';

import { UserRepository } from '@db/repositories';
import { UserEntity } from '@db/entities';

import { ExportUsersCommand } from './export-users.command';

interface UserExportRow {
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: string;
  roleName: string | null;
  createdAt: Date;
}

@Injectable()
export class ExportUsers {
  private readonly exportColumns: ExportColumn<UserExportRow>[] = [
    { key: 'email', header: 'Email' },
    { key: 'firstName', header: 'First Name' },
    { key: 'lastName', header: 'Last Name' },
    { key: 'status', header: 'Status' },
    { key: 'roleName', header: 'Role' },
    {
      key: 'createdAt',
      header: 'Created At',
      transform: (value) =>
        value instanceof Date ? value.toISOString() : String(value || ''),
    },
  ];

  constructor(
    private readonly exportService: ExportService,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: ExportUsersCommand): Promise<Buffer> {
    const users = await this.fetchData(command);

    const exportData: UserExportRow[] = users.map((user) => ({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      roleName: user.role?.name || null,
      createdAt: user.createdAt,
    }));

    if (command.format === 'csv') {
      return this.exportService.toCSV(exportData, this.exportColumns);
    }
    return this.exportService.toExcel(exportData, this.exportColumns, {
      sheetName: 'Users',
    });
  }

  private async fetchData(command: ExportUsersCommand): Promise<UserEntity[]> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.organizationId = :organizationId', {
        organizationId: command.organizationId,
      })
      .select([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.status',
        'user.createdAt',
        'role.id',
        'role.name',
      ]);

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

    queryBuilder.orderBy('user.createdAt', 'DESC');

    return queryBuilder.getMany();
  }
}

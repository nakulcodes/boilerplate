import { Injectable, BadRequestException } from '@nestjs/common';
import {
  ImportService,
  ImportColumn,
  ImportResult,
  StorageService,
} from '@boilerplate/core';

import { UserRepository, RoleRepository } from '@db/repositories';
import { UserStatus } from '@db/enums';
import { AuthService } from '@modules/auth/services/auth.service';

import { ImportUsersCommand } from './import-users.command';

interface UserImportRow {
  email: string;
  firstName: string | null;
  lastName: string | null;
  roleName: string | null;
  password: string | null;
}

export interface UserImportResult {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  createdCount: number;
  skippedCount: number;
  errors: Array<{
    row: number;
    column: string;
    value: unknown;
    message: string;
  }>;
}

@Injectable()
export class ImportUsers {
  private readonly importColumns: ImportColumn[] = [
    {
      key: 'email',
      header: 'Email',
      required: true,
      validate: (value) => {
        if (typeof value !== 'string') return 'Email must be a string';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) || 'Invalid email format';
      },
    },
    { key: 'firstName', header: 'First Name', required: true },
    { key: 'lastName', header: 'Last Name', required: false },
    { key: 'roleName', header: 'Role', required: false },
    { key: 'password', header: 'Password', required: false },
  ];

  constructor(
    private readonly importService: ImportService,
    private readonly storageService: StorageService,
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly authService: AuthService,
  ) {}

  private getFormatFromPath(path: string): 'csv' | 'xlsx' {
    const extension = path.split('.').pop()?.toLowerCase();
    if (extension === 'csv') return 'csv';
    if (extension === 'xlsx') return 'xlsx';
    throw new BadRequestException('File must be CSV or XLSX format');
  }

  private validatePath(path: string, organizationId: string): void {
    if (!path.startsWith(`organizations/${organizationId}/`)) {
      throw new BadRequestException('Invalid file path');
    }
  }

  async execute(command: ImportUsersCommand): Promise<UserImportResult> {
    this.validatePath(command.path, command.organizationId);

    const format = this.getFormatFromPath(command.path);

    const fileBuffer = await this.storageService.getFile(command.path);

    const parseResult: ImportResult<UserImportRow> =
      format === 'csv'
        ? await this.importService.parseCSV(fileBuffer, this.importColumns)
        : await this.importService.parseExcel(fileBuffer, this.importColumns);

    if (parseResult.totalRows === 0) {
      throw new BadRequestException('File is empty or has no valid data rows');
    }

    const roles = await this.roleRepository.find({
      where: { organizationId: command.organizationId },
    });
    const roleMap = new Map(roles.map((r) => [r.name.toLowerCase(), r.id]));

    const existingUsers = await this.userRepository.find({
      where: { organizationId: command.organizationId },
      select: ['email'],
    });
    const existingEmails = new Set(
      existingUsers.map((u) => u.email.toLowerCase()),
    );

    const errors = [...parseResult.errors];
    let createdCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < parseResult.data.length; i++) {
      const row = parseResult.data[i];
      const rowNumber = i + 2;

      if (existingEmails.has(row.email.toLowerCase())) {
        skippedCount++;
        errors.push({
          row: rowNumber,
          column: 'Email',
          value: row.email,
          message: 'User with this email already exists',
        });
        continue;
      }

      let roleId: string | null = null;
      if (row.roleName) {
        roleId = roleMap.get(row.roleName.toLowerCase()) || null;
        if (!roleId) {
          errors.push({
            row: rowNumber,
            column: 'Role',
            value: row.roleName,
            message: `Role "${row.roleName}" not found`,
          });
        }
      }

      if (!roleId) {
        const defaultRole = roles.find((r) => r.isDefault);
        roleId = defaultRole?.id || null;
      }

      try {
        const hashedPassword = row.password
          ? await this.authService.hashPassword(row.password)
          : null;

        const user = this.userRepository.create({
          email: row.email.toLowerCase(),
          firstName: row.firstName,
          lastName: row.lastName || null,
          password: hashedPassword,
          organizationId: command.organizationId,
          roleId,
          status: row.password ? UserStatus.ACTIVE : UserStatus.INVITED,
          isActive: !!row.password,
          onboarded: false,
        });

        await this.userRepository.save(user);
        existingEmails.add(row.email.toLowerCase());
        createdCount++;
      } catch (err) {
        errors.push({
          row: rowNumber,
          column: '',
          value: row.email,
          message: `Failed to create user: ${(err as Error).message}`,
        });
      }
    }

    return {
      totalRows: parseResult.totalRows,
      validRows: parseResult.validRows,
      invalidRows: parseResult.invalidRows,
      createdCount,
      skippedCount,
      errors,
    };
  }
}

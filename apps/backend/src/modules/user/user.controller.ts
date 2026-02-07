import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';

import { PERMISSIONS_ENUM } from '@boilerplate/core';
import { RequireAuthentication } from '../shared/decorators/require-authentication.decorator';
import { RequirePermissions } from '../shared/decorators/require-permissions.decorator';
import {
  UserSession,
  type UserSessionData,
} from '../shared/decorators/user-session.decorator';
import { ApiOkPaginatedResponse } from '../shared/decorators/api-ok-paginated-response.decorator';
import { PaginatedResponseDto } from '../shared/dtos/pagination-response';

import { InviteUserDto } from './dtos/invite-user.dto';
import { AcceptInviteDto } from './dtos/accept-invite.dto';
import { ResendInviteDto } from './dtos/resend-invite.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ListUsersDto } from './dtos/list-users.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { InviteResponseDto } from './dtos/invite-response.dto';
import { InviteUser } from './usecases/invite-user/invite-user.usecase';
import { InviteUserCommand } from './usecases/invite-user/invite-user.command';
import { AcceptInvite } from './usecases/accept-invite/accept-invite.usecase';
import { AcceptInviteCommand } from './usecases/accept-invite/accept-invite.command';
import { ResendInvite } from './usecases/resend-invite/resend-invite.usecase';
import { ResendInviteCommand } from './usecases/resend-invite/resend-invite.command';
import { BlockUser } from './usecases/block-user/block-user.usecase';
import { BlockUserCommand } from './usecases/block-user/block-user.command';
import { UnblockUser } from './usecases/unblock-user/unblock-user.usecase';
import { UnblockUserCommand } from './usecases/unblock-user/unblock-user.command';
import { UpdateUser } from './usecases/update-user/update-user.usecase';
import { UpdateUserCommand } from './usecases/update-user/update-user.command';
import { GetCurrentUser } from './usecases/get-current-user/get-current-user.usecase';
import { ListUsers } from './usecases/list-users/list-users.usecase';
import { ListUsersCommand } from './usecases/list-users/list-users.command';
import { UpdateProfile } from './usecases/update-profile/update-profile.usecase';
import { UpdateProfileCommand } from './usecases/update-profile/update-profile.command';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { CreateUser } from './usecases/create-user/create-user.usecase';
import { CreateUserCommand } from './usecases/create-user/create-user.command';
import { CreateUserDto } from './dtos/create-user.dto';
import {
  UserDropdownQueryDto,
  UserDropdownResponseDto,
} from './dtos/user-dropdown.dto';
import { ListUsersDropdown } from './usecases/list-users-dropdown/list-users-dropdown.usecase';
import { ListUsersDropdownCommand } from './usecases/list-users-dropdown/list-users-dropdown.command';
import { ExportUsersQueryDto } from './dtos/export-users.dto';
import { ExportUsers } from './usecases/export-users/export-users.usecase';
import { ExportUsersCommand } from './usecases/export-users/export-users.command';
import { ImportUsersResponseDto } from './dtos/import-users.dto';
import { ImportUsersRequestDto } from './dtos/import-users-request.dto';
import { ImportUsers } from './usecases/import-users/import-users.usecase';
import { ImportUsersCommand } from './usecases/import-users/import-users.command';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    private readonly inviteUser: InviteUser,
    private readonly acceptInvite: AcceptInvite,
    private readonly resendInvite: ResendInvite,
    private readonly blockUser: BlockUser,
    private readonly unblockUser: UnblockUser,
    private readonly updateUser: UpdateUser,
    private readonly getCurrentUser: GetCurrentUser,
    private readonly listUsers: ListUsers,
    private readonly updateProfile: UpdateProfile,
    private readonly createUser: CreateUser,
    private readonly listUsersDropdown: ListUsersDropdown,
    private readonly exportUsers: ExportUsers,
    private readonly importUsers: ImportUsers,
  ) {}

  @Get()
  @RequirePermissions('user:list:read')
  @ApiOperation({
    summary: 'Get users for dropdown with configurable fields',
    description:
      'Returns minimal user data for dropdowns. Use ?fields=id,firstName,lastName,email,role to select fields. Add ?paginate=true for paginated response.',
  })
  @ApiResponse({ status: 200, type: [UserDropdownResponseDto] })
  async getDropdown(
    @UserSession() user: UserSessionData,
    @Query() query: UserDropdownQueryDto,
  ): Promise<
    UserDropdownResponseDto[] | PaginatedResponseDto<UserDropdownResponseDto>
  > {
    const fields = query.fields
      ? query.fields.split(',').map((f) => f.trim())
      : ListUsersDropdownCommand.DEFAULT_FIELDS;

    return this.listUsersDropdown.execute(
      ListUsersDropdownCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        fields,
        paginate: query.paginate,
        page: query.page,
        limit: query.limit,
        search: query.search,
      }),
    );
  }

  @Get('export')
  @RequirePermissions('user:list:read')
  @ApiOperation({
    summary: 'Export users to CSV or Excel',
    description:
      'Export all users matching the filters to CSV or Excel format.',
  })
  @ApiResponse({
    status: 200,
    description: 'File download',
    content: {
      'text/csv': {},
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {},
    },
  })
  async exportToFile(
    @UserSession() user: UserSessionData,
    @Query() query: ExportUsersQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.exportUsers.execute(
      ExportUsersCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        format: query.format,
        status: query.status,
        search: query.search,
      }),
    );

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `users-export-${timestamp}.${query.format}`;
    const contentType =
      query.format === 'csv'
        ? 'text/csv'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Post('import')
  @RequirePermissions(PERMISSIONS_ENUM.USER_CREATE)
  @ApiOperation({
    summary: 'Import users from uploaded CSV or Excel file',
    description:
      'First upload the file using presigned URL from /storage/upload-url, then call this endpoint with the returned path. File columns: Email (required), First Name (required), Last Name, Role, Password.',
  })
  @ApiResponse({ status: 200, type: ImportUsersResponseDto })
  async importFromFile(
    @UserSession() user: UserSessionData,
    @Body() dto: ImportUsersRequestDto,
  ): Promise<ImportUsersResponseDto> {
    return this.importUsers.execute(
      ImportUsersCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        path: dto.path,
      }),
    );
  }

  @Post('invite')
  @RequirePermissions(PERMISSIONS_ENUM.USER_CREATE)
  @ApiOperation({ summary: 'Invite a new user to the organization' })
  @ApiResponse({ status: 201, type: InviteResponseDto })
  async invite(
    @UserSession() user: UserSessionData,
    @Body() dto: InviteUserDto,
  ): Promise<InviteResponseDto> {
    return this.inviteUser.execute(
      InviteUserCommand.create({
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        organizationId: user.organizationId,
        invitedBy: user.userId,
        roleId: dto.roleId,
      }),
    );
  }

  @Post('create')
  @RequirePermissions(PERMISSIONS_ENUM.USER_CREATE)
  @ApiOperation({
    summary: 'Directly create a user (immediately active with password)',
  })
  @ApiResponse({ status: 201 })
  async create(
    @UserSession() user: UserSessionData,
    @Body() dto: CreateUserDto,
  ) {
    return this.createUser.execute(
      CreateUserCommand.create({
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        organizationId: user.organizationId,
        createdBy: user.userId,
        roleId: dto.roleId,
        password: dto.password,
      }),
    );
  }

  @Post('accept-invite')
  @ApiOperation({ summary: 'Accept invitation and complete onboarding' })
  @ApiResponse({ status: 200 })
  async acceptInvitation(@Body() dto: AcceptInviteDto) {
    return this.acceptInvite.execute(
      AcceptInviteCommand.create({
        inviteToken: dto.inviteToken,
        firstName: dto.firstName,
        lastName: dto.lastName,
        password: dto.password,
      }),
    );
  }

  @Post('resend-invite')
  @RequirePermissions(PERMISSIONS_ENUM.USER_CREATE)
  @ApiOperation({ summary: 'Resend invitation to a pending user' })
  @ApiResponse({ status: 200, type: InviteResponseDto })
  async resendInvitation(
    @UserSession() user: UserSessionData,
    @Body() dto: ResendInviteDto,
  ) {
    return this.resendInvite.execute(
      ResendInviteCommand.create({
        userId: dto.userId,
        organizationId: user.organizationId,
        currentUserId: user.userId,
      }),
    );
  }

  @Get('me')
  @RequireAuthentication()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async getProfile(
    @UserSession() user: UserSessionData,
  ): Promise<UserResponseDto> {
    return this.getCurrentUser.execute(user.userId) as any;
  }

  @Put('profile')
  @RequireAuthentication()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async updateCurrentProfile(
    @UserSession() user: UserSessionData,
    @Body() dto: UpdateProfileDto,
  ): Promise<Partial<UserResponseDto>> {
    return this.updateProfile.execute(
      UpdateProfileCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        firstName: dto.firstName,
        lastName: dto.lastName,
      }),
    );
  }

  @Post('list')
  @RequirePermissions('user:list:read')
  @ApiOperation({
    summary: 'List users in organization with pagination and filters',
  })
  @ApiOkPaginatedResponse(UserResponseDto)
  async listOrganizationUsers(
    @UserSession() user: UserSessionData,
    @Body() dto: ListUsersDto,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    return this.listUsers.execute(
      ListUsersCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        status: dto.status,
        search: dto.search,
        invitedBy: dto.invitedBy,
        page: dto.page,
        limit: dto.limit,
        permissions: user.permissions,
        userRoleId: user.roleId,
      }),
    );
  }

  @Put(':id')
  @RequirePermissions('user:update')
  @ApiOperation({ summary: 'Update user details (firstName, lastName)' })
  @ApiResponse({ status: 200 })
  async update(
    @UserSession() user: UserSessionData,
    @Param('id') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.updateUser.execute(
      UpdateUserCommand.create({
        userId,
        organizationId: user.organizationId,
        currentUserId: user.userId,
        currentUserRoleId: user.roleId,
        permissions: user.permissions,
        firstName: dto.firstName,
        lastName: dto.lastName,
        roleId: dto.roleId,
      }),
    );
  }

  @Post(':id/block')
  @RequirePermissions(PERMISSIONS_ENUM.USER_UPDATE_STATUS)
  @ApiOperation({ summary: 'Block a user' })
  @ApiResponse({ status: 200 })
  async block(
    @UserSession() user: UserSessionData,
    @Param('id') userId: string,
  ) {
    return this.blockUser.execute(
      BlockUserCommand.create({
        userId,
        organizationId: user.organizationId,
        currentUserId: user.userId,
      }),
    );
  }

  @Post(':id/unblock')
  @RequirePermissions(PERMISSIONS_ENUM.USER_UPDATE_STATUS)
  @ApiOperation({ summary: 'Unblock a user' })
  @ApiResponse({ status: 200 })
  async unblock(
    @UserSession() user: UserSessionData,
    @Param('id') userId: string,
  ) {
    return this.unblockUser.execute(
      UnblockUserCommand.create({
        userId,
        organizationId: user.organizationId,
        currentUserId: user.userId,
      }),
    );
  }
}

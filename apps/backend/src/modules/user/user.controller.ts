import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

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
  ) {}

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
  @RequirePermissions(PERMISSIONS_ENUM.USER_LIST_READ)
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
      }),
    );
  }

  @Put(':id')
  @RequirePermissions(PERMISSIONS_ENUM.USER_UPDATE)
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
      }),
    );
  }
}

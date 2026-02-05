import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SetMetadata, UseGuards } from '@nestjs/common';
import { PERMISSIONS_ENUM } from '@boilerplate/core';

import { InviteUser } from '../../modules/user/usecases/invite-user/invite-user.usecase';
import { InviteUserCommand } from '../../modules/user/usecases/invite-user/invite-user.command';
import { AcceptInvite } from '../../modules/user/usecases/accept-invite/accept-invite.usecase';
import { AcceptInviteCommand } from '../../modules/user/usecases/accept-invite/accept-invite.command';
import { ResendInvite } from '../../modules/user/usecases/resend-invite/resend-invite.usecase';
import { ResendInviteCommand } from '../../modules/user/usecases/resend-invite/resend-invite.command';
import { BlockUser } from '../../modules/user/usecases/block-user/block-user.usecase';
import { BlockUserCommand } from '../../modules/user/usecases/block-user/block-user.command';
import { UnblockUser } from '../../modules/user/usecases/unblock-user/unblock-user.usecase';
import { UnblockUserCommand } from '../../modules/user/usecases/unblock-user/unblock-user.command';
import { UpdateUser } from '../../modules/user/usecases/update-user/update-user.usecase';
import { UpdateUserCommand } from '../../modules/user/usecases/update-user/update-user.command';
import { GetCurrentUser } from '../../modules/user/usecases/get-current-user/get-current-user.usecase';
import { ListUsers } from '../../modules/user/usecases/list-users/list-users.usecase';
import { ListUsersCommand } from '../../modules/user/usecases/list-users/list-users.command';
import { UpdateProfile } from '../../modules/user/usecases/update-profile/update-profile.usecase';
import { UpdateProfileCommand } from '../../modules/user/usecases/update-profile/update-profile.command';
import type { UserSessionData } from '../../modules/shared/decorators/user-session.decorator';
import { PERMISSIONS_KEY } from '../../modules/shared/decorators/require-permissions.decorator';

import { GqlAuthGuard, GqlPermissionsGuard } from '../guards';
import { CurrentUser } from '../decorators';
import {
  User,
  PaginatedUserList,
  SuccessResponse,
  InviteUserResponse,
  ResendInviteResponse,
} from '../types';
import type {
  InviteUserInput,
  ListUsersInput,
  UpdateUserInput,
  UpdateProfileInput,
  AcceptInviteInput,
} from '../inputs';
import {
  InviteUserInput as InviteUserInputClass,
  ListUsersInput as ListUsersInputClass,
  UpdateUserInput as UpdateUserInputClass,
  UpdateProfileInput as UpdateProfileInputClass,
  AcceptInviteInput as AcceptInviteInputClass,
} from '../inputs';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly inviteUserUsecase: InviteUser,
    private readonly acceptInviteUsecase: AcceptInvite,
    private readonly resendInviteUsecase: ResendInvite,
    private readonly blockUserUsecase: BlockUser,
    private readonly unblockUserUsecase: UnblockUser,
    private readonly updateUserUsecase: UpdateUser,
    private readonly getCurrentUserUsecase: GetCurrentUser,
    private readonly listUsersUsecase: ListUsers,
    private readonly updateProfileUsecase: UpdateProfile,
  ) {}

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: UserSessionData): Promise<User> {
    const result = await this.getCurrentUserUsecase.execute(user.userId);
    return result as unknown as User;
  }

  @Query(() => PaginatedUserList)
  @UseGuards(GqlAuthGuard, GqlPermissionsGuard)
  @SetMetadata(PERMISSIONS_KEY, ['user:list:read'])
  async users(
    @CurrentUser() user: UserSessionData,
    @Args('input', { nullable: true, type: () => ListUsersInputClass })
    input?: ListUsersInput,
  ): Promise<PaginatedUserList> {
    const result = await this.listUsersUsecase.execute(
      ListUsersCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        status: input?.status,
        search: input?.search,
        invitedBy: input?.invitedBy,
        page: input?.page ?? 1,
        limit: input?.limit ?? 10,
        permissions: user.permissions,
        userRoleId: user.roleId,
      }),
    );
    return result as unknown as PaginatedUserList;
  }

  @Mutation(() => InviteUserResponse)
  @UseGuards(GqlAuthGuard, GqlPermissionsGuard)
  @SetMetadata(PERMISSIONS_KEY, [PERMISSIONS_ENUM.USER_CREATE])
  async inviteUser(
    @CurrentUser() user: UserSessionData,
    @Args('input', { type: () => InviteUserInputClass }) input: InviteUserInput,
  ): Promise<InviteUserResponse> {
    return this.inviteUserUsecase.execute(
      InviteUserCommand.create({
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        organizationId: user.organizationId,
        invitedBy: user.userId,
        roleId: input.roleId,
      }),
    );
  }

  @Mutation(() => SuccessResponse)
  async acceptInvite(
    @Args('input', { type: () => AcceptInviteInputClass })
    input: AcceptInviteInput,
  ): Promise<SuccessResponse> {
    const result = await this.acceptInviteUsecase.execute(
      AcceptInviteCommand.create({
        inviteToken: input.inviteToken,
        firstName: input.firstName,
        lastName: input.lastName,
        password: input.password,
      }),
    );
    return { success: result.success };
  }

  @Mutation(() => ResendInviteResponse)
  @UseGuards(GqlAuthGuard, GqlPermissionsGuard)
  @SetMetadata(PERMISSIONS_KEY, [PERMISSIONS_ENUM.USER_CREATE])
  async resendInvite(
    @CurrentUser() user: UserSessionData,
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<ResendInviteResponse> {
    const result = await this.resendInviteUsecase.execute(
      ResendInviteCommand.create({
        userId,
        organizationId: user.organizationId,
        currentUserId: user.userId,
      }),
    );
    return {
      success: true,
      inviteLink: result.inviteLink,
      emailSent: result.emailSent,
    };
  }

  @Mutation(() => SuccessResponse)
  @UseGuards(GqlAuthGuard, GqlPermissionsGuard)
  @SetMetadata(PERMISSIONS_KEY, [PERMISSIONS_ENUM.USER_UPDATE_ALL])
  async updateUser(
    @CurrentUser() user: UserSessionData,
    @Args('userId', { type: () => ID }) userId: string,
    @Args('input', { type: () => UpdateUserInputClass }) input: UpdateUserInput,
  ): Promise<SuccessResponse> {
    return this.updateUserUsecase.execute(
      UpdateUserCommand.create({
        userId,
        organizationId: user.organizationId,
        currentUserId: user.userId,
        currentUserRoleId: user.roleId,
        permissions: user.permissions,
        firstName: input.firstName,
        lastName: input.lastName,
        roleId: input.roleId,
      }),
    );
  }

  @Mutation(() => SuccessResponse)
  @UseGuards(GqlAuthGuard)
  async updateProfile(
    @CurrentUser() user: UserSessionData,
    @Args('input', { type: () => UpdateProfileInputClass })
    input: UpdateProfileInput,
  ): Promise<SuccessResponse> {
    await this.updateProfileUsecase.execute(
      UpdateProfileCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        firstName: input.firstName,
        lastName: input.lastName,
      }),
    );
    return { success: true };
  }

  @Mutation(() => SuccessResponse)
  @UseGuards(GqlAuthGuard, GqlPermissionsGuard)
  @SetMetadata(PERMISSIONS_KEY, [PERMISSIONS_ENUM.USER_UPDATE_STATUS])
  async blockUser(
    @CurrentUser() user: UserSessionData,
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<SuccessResponse> {
    return this.blockUserUsecase.execute(
      BlockUserCommand.create({
        userId,
        organizationId: user.organizationId,
        currentUserId: user.userId,
      }),
    );
  }

  @Mutation(() => SuccessResponse)
  @UseGuards(GqlAuthGuard, GqlPermissionsGuard)
  @SetMetadata(PERMISSIONS_KEY, [PERMISSIONS_ENUM.USER_UPDATE_STATUS])
  async unblockUser(
    @CurrentUser() user: UserSessionData,
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<SuccessResponse> {
    return this.unblockUserUsecase.execute(
      UnblockUserCommand.create({
        userId,
        organizationId: user.organizationId,
        currentUserId: user.userId,
      }),
    );
  }
}

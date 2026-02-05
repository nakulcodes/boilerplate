import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SetMetadata, UseGuards } from '@nestjs/common';
import { PERMISSIONS_ENUM } from '@boilerplate/core';

import { CreateRole } from '../../modules/role/usecases/create-role/create-role.usecase';
import { CreateRoleCommand } from '../../modules/role/usecases/create-role/create-role.command';
import { UpdateRole } from '../../modules/role/usecases/update-role/update-role.usecase';
import { UpdateRoleCommand } from '../../modules/role/usecases/update-role/update-role.command';
import { DeleteRole } from '../../modules/role/usecases/delete-role/delete-role.usecase';
import { DeleteRoleCommand } from '../../modules/role/usecases/delete-role/delete-role.command';
import { ListRoles } from '../../modules/role/usecases/list-roles/list-roles.usecase';
import { ListRolesCommand } from '../../modules/role/usecases/list-roles/list-roles.command';
import { GetRole } from '../../modules/role/usecases/get-role/get-role.usecase';
import type { UserSessionData } from '../../modules/shared/decorators/user-session.decorator';
import { PERMISSIONS_KEY } from '../../modules/shared/decorators/require-permissions.decorator';

import { GqlAuthGuard, GqlPermissionsGuard } from '../guards';
import { CurrentUser } from '../decorators';
import { Role } from '../types';
import type { CreateRoleInput, UpdateRoleInput } from '../inputs';
import {
  CreateRoleInput as CreateRoleInputClass,
  UpdateRoleInput as UpdateRoleInputClass,
} from '../inputs';

@Resolver(() => Role)
export class RoleResolver {
  constructor(
    private readonly createRoleUsecase: CreateRole,
    private readonly updateRoleUsecase: UpdateRole,
    private readonly deleteRoleUsecase: DeleteRole,
    private readonly listRolesUsecase: ListRoles,
    private readonly getRoleUsecase: GetRole,
  ) {}

  @Query(() => [Role])
  @UseGuards(GqlAuthGuard, GqlPermissionsGuard)
  @SetMetadata(PERMISSIONS_KEY, [PERMISSIONS_ENUM.ROLE_LIST_READ])
  async roles(@CurrentUser() user: UserSessionData): Promise<Role[]> {
    const result = await this.listRolesUsecase.execute(
      ListRolesCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
      }),
    );
    return result as unknown as Role[];
  }

  @Query(() => Role)
  @UseGuards(GqlAuthGuard, GqlPermissionsGuard)
  @SetMetadata(PERMISSIONS_KEY, [PERMISSIONS_ENUM.ROLE_READ])
  async role(
    @CurrentUser() user: UserSessionData,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Role> {
    const result = await this.getRoleUsecase.execute(id, user.organizationId);
    return result as unknown as Role;
  }

  @Mutation(() => Role)
  @UseGuards(GqlAuthGuard, GqlPermissionsGuard)
  @SetMetadata(PERMISSIONS_KEY, [PERMISSIONS_ENUM.ROLE_CREATE])
  async createRole(
    @CurrentUser() user: UserSessionData,
    @Args('input', { type: () => CreateRoleInputClass }) input: CreateRoleInput,
  ): Promise<Role> {
    const result = await this.createRoleUsecase.execute(
      CreateRoleCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        name: input.name,
        permissions: input.permissions,
      }),
    );
    return result as unknown as Role;
  }

  @Mutation(() => Role)
  @UseGuards(GqlAuthGuard, GqlPermissionsGuard)
  @SetMetadata(PERMISSIONS_KEY, [PERMISSIONS_ENUM.ROLE_UPDATE])
  async updateRole(
    @CurrentUser() user: UserSessionData,
    @Args('id', { type: () => ID }) id: string,
    @Args('input', { type: () => UpdateRoleInputClass }) input: UpdateRoleInput,
  ): Promise<Role> {
    const result = await this.updateRoleUsecase.execute(
      UpdateRoleCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        roleId: id,
        name: input.name,
        permissions: input.permissions,
      }),
    );
    return result as unknown as Role;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, GqlPermissionsGuard)
  @SetMetadata(PERMISSIONS_KEY, [PERMISSIONS_ENUM.ROLE_UPDATE])
  async deleteRole(
    @CurrentUser() user: UserSessionData,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.deleteRoleUsecase.execute(
      DeleteRoleCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        roleId: id,
      }),
    );
    return true;
  }
}

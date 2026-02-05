import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { Login } from '../../modules/auth/usecases/login/login.usecase';
import { LoginCommand } from '../../modules/auth/usecases/login/login.command';
import { UserRegister } from '../../modules/auth/usecases/register/user-register.usecase';
import { UserRegisterCommand } from '../../modules/auth/usecases/register/user-register.command';
import { RefreshToken } from '../../modules/auth/usecases/refresh-token/refresh-token.usecase';
import { RefreshTokenCommand } from '../../modules/auth/usecases/refresh-token/refresh-token.command';
import { Logout } from '../../modules/auth/usecases/logout/logout.usecase';
import { LogoutCommand } from '../../modules/auth/usecases/logout/logout.command';
import { UpdatePassword } from '../../modules/auth/usecases/update-password/update-password.usecase';
import { UpdatePasswordCommand } from '../../modules/auth/usecases/update-password/update-password.command';
import { PasswordResetRequest } from '../../modules/auth/usecases/password-reset-request/password-reset-request.usecase';
import { PasswordResetRequestCommand } from '../../modules/auth/usecases/password-reset-request/password-reset-request.command';
import { PasswordReset } from '../../modules/auth/usecases/password-reset/password-reset.usecase';
import { PasswordResetCommand } from '../../modules/auth/usecases/password-reset/password-reset.command';
import type { UserSessionData } from '../../modules/shared/decorators/user-session.decorator';

import { GqlAuthGuard, GqlRefreshGuard } from '../guards';
import { CurrentUser } from '../decorators';
import { AuthResponse, TokenResponse } from '../types';
import type {
  LoginInput,
  RegisterInput,
  UpdatePasswordInput,
  PasswordResetRequestInput,
  PasswordResetInput,
} from '../inputs';
import {
  LoginInput as LoginInputClass,
  RegisterInput as RegisterInputClass,
  UpdatePasswordInput as UpdatePasswordInputClass,
  PasswordResetRequestInput as PasswordResetRequestInputClass,
  PasswordResetInput as PasswordResetInputClass,
} from '../inputs';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly loginUsecase: Login,
    private readonly registerUsecase: UserRegister,
    private readonly refreshTokenUsecase: RefreshToken,
    private readonly logoutUsecase: Logout,
    private readonly updatePasswordUsecase: UpdatePassword,
    private readonly passwordResetRequestUsecase: PasswordResetRequest,
    private readonly passwordResetUsecase: PasswordReset,
  ) {}

  @Mutation(() => AuthResponse)
  async login(
    @Args('input', { type: () => LoginInputClass }) input: LoginInput,
  ): Promise<AuthResponse> {
    const result = await this.loginUsecase.execute(
      LoginCommand.create({
        email: input.email,
        password: input.password,
      }),
    );

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName || undefined,
        organizationId: result.user.organizationId,
      },
      organization: {
        id: result.organization.id,
        name: result.organization.name,
      },
    } as AuthResponse;
  }

  @Mutation(() => AuthResponse)
  async register(
    @Args('input', { type: () => RegisterInputClass }) input: RegisterInput,
  ): Promise<AuthResponse> {
    const result = await this.registerUsecase.execute(
      UserRegisterCommand.create({
        email: input.email,
        password: input.password,
        firstName: input.firstName,
        lastName: input.lastName,
        organizationName: input.organizationName,
      }),
    );

    const loginResult = await this.loginUsecase.execute(
      LoginCommand.create({
        email: input.email,
        password: input.password,
      }),
    );

    return {
      accessToken: loginResult.accessToken,
      refreshToken: loginResult.refreshToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName || undefined,
        organizationId: result.user.organizationId,
      },
      organization: {
        id: result.organization.id,
        name: result.organization.name,
      },
    } as AuthResponse;
  }

  @Mutation(() => TokenResponse)
  @UseGuards(GqlRefreshGuard)
  async refreshToken(
    @CurrentUser() user: UserSessionData,
    @Args('refreshToken') refreshToken: string,
  ): Promise<TokenResponse> {
    return await this.refreshTokenUsecase.execute(
      RefreshTokenCommand.create({
        refreshToken,
        userId: user.userId,
        organizationId: user.organizationId,
      }),
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async logout(
    @CurrentUser() user: UserSessionData,
    @Args('refreshToken') refreshToken: string,
  ): Promise<boolean> {
    await this.logoutUsecase.execute(
      LogoutCommand.create({
        refreshToken,
        userId: user.userId,
        organizationId: user.organizationId,
      }),
    );
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async updatePassword(
    @CurrentUser() user: UserSessionData,
    @Args('input', { type: () => UpdatePasswordInputClass })
    input: UpdatePasswordInput,
  ): Promise<boolean> {
    await this.updatePasswordUsecase.execute(
      UpdatePasswordCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
        confirmPassword: input.confirmPassword,
      }),
    );
    return true;
  }

  @Mutation(() => Boolean)
  async requestPasswordReset(
    @Args('input', { type: () => PasswordResetRequestInputClass })
    input: PasswordResetRequestInput,
  ): Promise<boolean> {
    await this.passwordResetRequestUsecase.execute(
      PasswordResetRequestCommand.create({
        email: input.email,
      }),
    );
    return true;
  }

  @Mutation(() => Boolean)
  async resetPassword(
    @Args('input', { type: () => PasswordResetInputClass })
    input: PasswordResetInput,
  ): Promise<boolean> {
    await this.passwordResetUsecase.execute(
      PasswordResetCommand.create({
        token: input.token,
        password: input.password,
      }),
    );
    return true;
  }
}

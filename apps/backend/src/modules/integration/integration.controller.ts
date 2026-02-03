import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Redirect,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { PERMISSIONS_ENUM } from '@boilerplate/core';

import {
  UserSession,
  type UserSessionData,
} from '../shared/decorators/user-session.decorator';
import { RequirePermissions } from '../shared/decorators/require-permissions.decorator';
import { IntegrationListItemDto } from './dtos/integration-list-item.dto';
import { ListIntegrations } from './usecases/list-integrations/list-integrations.usecase';
import { ListIntegrationsCommand } from './usecases/list-integrations/list-integrations.command';
import { GetAuthUrl } from './usecases/get-auth-url/get-auth-url.usecase';
import { GetAuthUrlCommand } from './usecases/get-auth-url/get-auth-url.command';
import { HandleOAuthCallback } from './usecases/handle-oauth-callback/handle-oauth-callback.usecase';
import { HandleOAuthCallbackCommand } from './usecases/handle-oauth-callback/handle-oauth-callback.command';
import { DisconnectIntegration } from './usecases/disconnect-integration/disconnect-integration.usecase';
import { DisconnectIntegrationCommand } from './usecases/disconnect-integration/disconnect-integration.command';

@ApiTags('Integrations')
@Controller('integrations')
export class IntegrationController {
  constructor(
    private readonly listIntegrations: ListIntegrations,
    private readonly getAuthUrl: GetAuthUrl,
    private readonly handleOAuthCallback: HandleOAuthCallback,
    private readonly disconnectIntegration: DisconnectIntegration,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @RequirePermissions(PERMISSIONS_ENUM.INTEGRATION_LIST_READ)
  @ApiOperation({ summary: 'List all integrations with connection status' })
  @ApiResponse({ status: 200, type: [IntegrationListItemDto] })
  async list(
    @UserSession() user: UserSessionData,
  ): Promise<IntegrationListItemDto[]> {
    return this.listIntegrations.execute(
      ListIntegrationsCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
      }),
    );
  }

  @Post(':provider/connect')
  @RequirePermissions(PERMISSIONS_ENUM.INTEGRATION_CONNECT)
  @ApiOperation({ summary: 'Get OAuth authorization URL for a provider' })
  @ApiResponse({ status: 200 })
  async connect(
    @UserSession() user: UserSessionData,
    @Param('provider') provider: string,
  ): Promise<{ authUrl: string }> {
    return this.getAuthUrl.execute(
      GetAuthUrlCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        provider,
      }),
    );
  }

  @Get('callback')
  @ApiOperation({ summary: 'Handle OAuth callback from provider' })
  @Redirect()
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string | undefined,
  ): Promise<{ url: string }> {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const callbackPath = '/dashboard/settings/integrations/callback';

    if (error) {
      return {
        url: `${frontendUrl}${callbackPath}?error=${encodeURIComponent(error)}`,
      };
    }

    try {
      const result = await this.handleOAuthCallback.execute(
        HandleOAuthCallbackCommand.create({ code, state }),
      );

      return {
        url: `${frontendUrl}${callbackPath}?success=true&provider=${result.provider}`,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return {
        url: `${frontendUrl}${callbackPath}?error=${encodeURIComponent(errorMessage)}`,
      };
    }
  }

  @Delete(':provider')
  @RequirePermissions(PERMISSIONS_ENUM.INTEGRATION_DISCONNECT)
  @ApiOperation({ summary: 'Disconnect an integration' })
  @ApiResponse({ status: 200 })
  async disconnect(
    @UserSession() user: UserSessionData,
    @Param('provider') provider: string,
  ): Promise<void> {
    return this.disconnectIntegration.execute(
      DisconnectIntegrationCommand.create({
        userId: user.userId,
        organizationId: user.organizationId,
        provider,
      }),
    );
  }
}

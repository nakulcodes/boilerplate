import { Module } from '@nestjs/common';
import { IntegrationController } from './integration.controller';
import { ListIntegrations } from './usecases/list-integrations/list-integrations.usecase';
import { GetAuthUrl } from './usecases/get-auth-url/get-auth-url.usecase';
import { HandleOAuthCallback } from './usecases/handle-oauth-callback/handle-oauth-callback.usecase';
import { DisconnectIntegration } from './usecases/disconnect-integration/disconnect-integration.usecase';

const USE_CASES = [
  ListIntegrations,
  GetAuthUrl,
  HandleOAuthCallback,
  DisconnectIntegration,
];

@Module({
  controllers: [IntegrationController],
  providers: [...USE_CASES],
})
export class IntegrationModule {}

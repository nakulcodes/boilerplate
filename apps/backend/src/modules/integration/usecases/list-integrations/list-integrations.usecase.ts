import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SupportedIntegrationRepository,
  OrganizationIntegrationRepository,
} from '@db/repositories';
import { OrganizationIntegrationStatus } from '@db/enums';
import { ListIntegrationsCommand } from './list-integrations.command';
import { IntegrationListItemDto } from '../../dtos/integration-list-item.dto';

@Injectable()
export class ListIntegrations {
  constructor(
    private readonly supportedIntegrationRepository: SupportedIntegrationRepository,
    private readonly organizationIntegrationRepository: OrganizationIntegrationRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    command: ListIntegrationsCommand,
  ): Promise<IntegrationListItemDto[]> {
    const supportedIntegrations =
      await this.supportedIntegrationRepository.findAllActive();

    const orgIntegrations =
      await this.organizationIntegrationRepository.findByOrganizationId(
        command.organizationId,
      );

    const orgIntegrationMap = new Map(
      orgIntegrations.map((oi) => [oi.supportedIntegrationId, oi]),
    );

    return supportedIntegrations.map((si) => {
      const orgIntegration = orgIntegrationMap.get(si.id);
      const isConnected =
        orgIntegration?.status === OrganizationIntegrationStatus.CONNECTED;

      return {
        id: si.id,
        provider: si.provider,
        name: si.name,
        description: si.description,
        iconUrl: si.iconUrl,
        category: si.category,
        isConnected,
        isConfigured: this.isProviderConfigured(si.provider),
        accountEmail: orgIntegration?.accountEmail ?? null,
        accountName: orgIntegration?.accountName ?? null,
        connectedAt: orgIntegration?.createdAt?.toISOString(),
        status: orgIntegration?.status,
        errorMessage: orgIntegration?.errorMessage ?? null,
      };
    });
  }

  private isProviderConfigured(provider: string): boolean {
    switch (provider) {
      case 'google_calendar':
        return !!(
          this.configService.get('GOOGLE_CLIENT_ID') &&
          this.configService.get('GOOGLE_CLIENT_SECRET')
        );
      case 'zoom':
        return !!(
          this.configService.get('ZOOM_CLIENT_ID') &&
          this.configService.get('ZOOM_CLIENT_SECRET')
        );
      case 'slack':
        return !!(
          this.configService.get('SLACK_CLIENT_ID') &&
          this.configService.get('SLACK_CLIENT_SECRET')
        );
      case 'microsoft_teams':
        return !!(
          this.configService.get('MICROSOFT_CLIENT_ID') &&
          this.configService.get('MICROSOFT_CLIENT_SECRET')
        );
      default:
        return false;
    }
  }
}

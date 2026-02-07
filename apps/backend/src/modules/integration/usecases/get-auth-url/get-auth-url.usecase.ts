import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupportedIntegrationRepository } from '@db/repositories';
import { GetAuthUrlCommand } from './get-auth-url.command';

@Injectable()
export class GetAuthUrl {
  constructor(
    private readonly supportedIntegrationRepository: SupportedIntegrationRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: GetAuthUrlCommand): Promise<{ authUrl: string }> {
    const integration =
      await this.supportedIntegrationRepository.findByProvider(
        command.provider,
      );

    if (!integration) {
      throw new BadRequestException(
        `Integration "${command.provider}" not found`,
      );
    }

    if (!integration.isActive) {
      throw new BadRequestException(
        `Integration "${command.provider}" is not active`,
      );
    }

    const authUrl = this.buildAuthUrl(
      command.provider,
      command.organizationId,
      command.userId,
      integration.id,
    );

    return { authUrl };
  }

  private buildAuthUrl(
    provider: string,
    organizationId: string,
    userId: string,
    integrationId: string,
  ): string {
    const state = Buffer.from(
      JSON.stringify({
        organizationId,
        userId,
        integrationId,
        provider,
        timestamp: Date.now(),
      }),
    ).toString('base64');

    const redirectUri =
      this.configService.get<string>('OAUTH_REDIRECT_URI') ||
      `${this.configService.get<string>('API_URL')}/api/v1/integrations/callback`;

    switch (provider) {
      case 'google_calendar':
        return this.buildGoogleAuthUrl(state, redirectUri);
      case 'zoom':
        return this.buildZoomAuthUrl(state, redirectUri);
      case 'slack':
        return this.buildSlackAuthUrl(state, redirectUri);
      case 'microsoft_teams':
        return this.buildMicrosoftAuthUrl(state, redirectUri);
      default:
        throw new BadRequestException(`Unsupported provider: ${provider}`);
    }
  }

  private buildGoogleAuthUrl(state: string, redirectUri: string): string {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      throw new BadRequestException('Google Calendar is not configured');
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope:
        'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
      access_type: 'offline',
      prompt: 'consent',
      state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  private buildZoomAuthUrl(state: string, redirectUri: string): string {
    const clientId = this.configService.get<string>('ZOOM_CLIENT_ID');
    if (!clientId) {
      throw new BadRequestException('Zoom is not configured');
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
    });

    return `https://zoom.us/oauth/authorize?${params.toString()}`;
  }

  private buildSlackAuthUrl(state: string, redirectUri: string): string {
    const clientId = this.configService.get<string>('SLACK_CLIENT_ID');
    if (!clientId) {
      throw new BadRequestException('Slack is not configured');
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'chat:write,channels:read,users:read',
      state,
    });

    return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
  }

  private buildMicrosoftAuthUrl(state: string, redirectUri: string): string {
    const clientId = this.configService.get<string>('MICROSOFT_CLIENT_ID');
    if (!clientId) {
      throw new BadRequestException('Microsoft Teams is not configured');
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope:
        'offline_access User.Read Calendars.ReadWrite OnlineMeetings.ReadWrite',
      state,
    });

    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
  }
}

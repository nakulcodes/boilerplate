'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '@/utils/api-client';
import { API_ROUTES } from '@/config/api-routes';
import { PERMISSIONS_ENUM } from '@/constants/permissions.constants';
import { usePermissions } from '@/hooks/use-permissions';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/lib/toast';
import type { IntegrationListItem } from '@/types/integration.type';

function IntegrationCard({
  integration,
  onConnect,
  onDisconnect,
  connecting,
}: {
  integration: IntegrationListItem;
  onConnect: (provider: string) => void;
  onDisconnect: (provider: string) => void;
  connecting: string | null;
}) {
  const { hasPermission } = usePermissions();
  const isConnecting = connecting === integration.provider;

  const getStatusBadge = () => {
    if (!integration.isConfigured) {
      return null;
    }

    switch (integration.status) {
      case 'connected':
        return (
          <Badge variant="default" className="bg-green-600">
            Connected
          </Badge>
        );
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Not Connected</Badge>;
    }
  };

  const getActionButton = () => {
    if (!integration.isConfigured) {
      return (
        <Button disabled variant="outline" className="w-full">
          Not Configured
        </Button>
      );
    }

    if (integration.isConnected) {
      if (!hasPermission(PERMISSIONS_ENUM.INTEGRATION_DISCONNECT)) {
        return null;
      }
      return (
        <Button
          variant="outline"
          onClick={() => onDisconnect(integration.provider)}
          className="w-full"
        >
          Disconnect
        </Button>
      );
    }

    if (!hasPermission(PERMISSIONS_ENUM.INTEGRATION_CONNECT)) {
      return null;
    }

    if (integration.status === 'expired') {
      return (
        <Button
          onClick={() => onConnect(integration.provider)}
          disabled={isConnecting}
          className="w-full"
        >
          {isConnecting ? 'Reconnecting...' : 'Reconnect'}
        </Button>
      );
    }

    return (
      <Button
        onClick={() => onConnect(integration.provider)}
        disabled={isConnecting}
        className="w-full"
      >
        {isConnecting ? 'Connecting...' : 'Connect'}
      </Button>
    );
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start gap-4 space-y-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-muted/50 p-2">
          {integration.iconUrl ? (
            <img
              src={integration.iconUrl}
              alt={integration.name}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="h-full w-full rounded bg-muted" />
          )}
        </div>
        <div className="flex-1 space-y-1">
          <CardTitle className="text-base">{integration.name}</CardTitle>
          {integration.description && (
            <CardDescription className="text-sm line-clamp-2">
              {integration.description}
            </CardDescription>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <div className="flex items-center gap-2">{getStatusBadge()}</div>
        {integration.isConnected && integration.accountEmail && (
          <p className="text-sm text-muted-foreground">
            Connected as: {integration.accountEmail}
          </p>
        )}
        {!integration.isConfigured && (
          <p className="text-sm text-muted-foreground">
            This integration is not configured. Contact your administrator.
          </p>
        )}
        {integration.status === 'error' && integration.errorMessage && (
          <p className="text-sm text-destructive">{integration.errorMessage}</p>
        )}
      </CardContent>
      <CardFooter>{getActionButton()}</CardFooter>
    </Card>
  );
}

function IntegrationsContent() {
  const [integrations, setIntegrations] = useState<IntegrationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnectTarget, setDisconnectTarget] =
    useState<IntegrationListItem | null>(null);

  const loadIntegrations = useCallback(async () => {
    try {
      const data = await fetchApi<IntegrationListItem[]>(
        API_ROUTES.INTEGRATIONS.LIST,
      );
      setIntegrations(data || []);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load integrations';
      toast.error(message);
      setIntegrations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIntegrations();
  }, [loadIntegrations]);

  const handleConnect = async (provider: string) => {
    setConnecting(provider);
    try {
      const { authUrl } = await fetchApi<{ authUrl: string }>(
        API_ROUTES.INTEGRATIONS.CONNECT(provider),
        { method: 'POST' },
      );
      window.location.href = authUrl;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to initiate connection';
      toast.error(message);
      setConnecting(null);
    }
  };

  const handleDisconnect = async () => {
    if (!disconnectTarget) return;
    try {
      await fetchApi(
        API_ROUTES.INTEGRATIONS.DISCONNECT(disconnectTarget.provider),
        {
          method: 'DELETE',
        },
      );
      toast.success(`${disconnectTarget.name} disconnected`);
      loadIntegrations();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to disconnect';
      toast.error(message);
    } finally {
      setDisconnectTarget(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Integrations</h2>
        <p className="text-sm text-muted-foreground">
          Connect third-party services to your organization
        </p>
      </div>

      {integrations.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No integrations available
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onConnect={handleConnect}
              onDisconnect={(provider) => {
                const target = integrations.find(
                  (i) => i.provider === provider,
                );
                if (target) setDisconnectTarget(target);
              }}
              connecting={connecting}
            />
          ))}
        </div>
      )}

      <AlertDialog
        open={!!disconnectTarget}
        onOpenChange={(open) => !open && setDisconnectTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect integration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect {disconnectTarget?.name}? You
              can reconnect it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisconnect}>
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <PermissionGuard
      permissions={PERMISSIONS_ENUM.INTEGRATION_LIST_READ}
      fallback={
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          You don&apos;t have permission to view integrations
        </div>
      }
    >
      <IntegrationsContent />
    </PermissionGuard>
  );
}

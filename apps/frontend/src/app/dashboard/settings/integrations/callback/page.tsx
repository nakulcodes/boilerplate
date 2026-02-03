'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';
import { Skeleton } from '@/components/ui/skeleton';

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const success = searchParams.get('success');
    const provider = searchParams.get('provider');
    const error = searchParams.get('error');

    if (window.opener) {
      window.opener.postMessage(
        {
          type: 'oauth-callback',
          success: success === 'true',
          provider,
          error,
        },
        window.location.origin,
      );
      window.close();
      return;
    }

    if (success === 'true' && provider) {
      const providerName = provider.replace(/_/g, ' ');
      toast.success(
        `${providerName.charAt(0).toUpperCase() + providerName.slice(1)} connected successfully`,
      );
    } else if (error) {
      toast.error(`Failed to connect: ${error}`);
    }

    router.replace('/dashboard/settings/integrations');
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-4">
        <Skeleton className="h-8 w-48 mx-auto" />
        <p className="text-muted-foreground">Processing connection...</p>
      </div>
    </div>
  );
}

export default function IntegrationCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <Skeleton className="h-8 w-48" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}

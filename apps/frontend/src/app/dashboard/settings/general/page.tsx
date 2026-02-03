'use client';

import { useSession } from '@/contexts/session-context';

export default function GeneralSettingsPage() {
  const { user } = useSession();

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-6 space-y-4">
        <h3 className="text-lg font-medium">Account</h3>
        <div className="grid gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-24">Email</span>
            <span>{user?.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-24">Name</span>
            <span>
              {user?.firstName || ''} {user?.lastName || ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

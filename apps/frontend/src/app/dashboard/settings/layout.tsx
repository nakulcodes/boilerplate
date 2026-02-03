'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/use-permissions';
import { PERMISSIONS_ENUM } from '@/constants/permissions.constants';

interface SettingsTab {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
  permission?: string;
}

const tabs: SettingsTab[] = [
  {
    href: '/dashboard/settings',
    label: 'General',
    match: (p) => p === '/dashboard/settings',
  },
  {
    href: '/dashboard/settings/users',
    label: 'Users',
    match: (p) => p.startsWith('/dashboard/settings/users'),
    permission: 'user:list:read',
  },
  {
    href: '/dashboard/settings/roles',
    label: 'Roles',
    match: (p) => p.startsWith('/dashboard/settings/roles'),
    permission: PERMISSIONS_ENUM.ROLE_LIST_READ,
  },
  {
    href: '/dashboard/settings/audit',
    label: 'Audit Logs',
    match: (p) => p.startsWith('/dashboard/settings/audit'),
    permission: PERMISSIONS_ENUM.AUDIT_LIST_READ,
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { hasPermission } = usePermissions();

  const visibleTabs = tabs.filter(
    (tab) => !tab.permission || hasPermission(tab.permission),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your organization settings
        </p>
      </div>
      <div className="inline-flex h-9 items-center justify-center rounded-lg bg-zinc-100 p-1 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        {visibleTabs.map((tab) => {
          const isActive = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all',
                isActive
                  ? 'bg-white text-zinc-950 shadow dark:bg-zinc-950 dark:text-zinc-50'
                  : 'hover:text-zinc-900 dark:hover:text-zinc-100',
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      <div>{children}</div>
    </div>
  );
}

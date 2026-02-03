'use client';

import Link from 'next/link';
import { User, Users, ShieldCheck, ClipboardList } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { PERMISSIONS_ENUM } from '@/constants/permissions.constants';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

interface SettingsCard {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
}

const settingsCards: SettingsCard[] = [
  {
    href: '/dashboard/settings/general',
    title: 'General',
    description: 'Account information and profile settings',
    icon: User,
  },
  {
    href: '/dashboard/settings/users',
    title: 'Users',
    description: 'Manage team members and invitations',
    icon: Users,
    permission: 'user:list:read',
  },
  {
    href: '/dashboard/settings/roles',
    title: 'Roles',
    description: 'Configure roles and permissions',
    icon: ShieldCheck,
    permission: PERMISSIONS_ENUM.ROLE_LIST_READ,
  },
  {
    href: '/dashboard/settings/audit',
    title: 'Audit Logs',
    description: 'Track all actions in your organization',
    icon: ClipboardList,
    permission: PERMISSIONS_ENUM.AUDIT_LIST_READ,
  },
];

export default function SettingsPage() {
  const { hasPermission } = usePermissions();

  const visibleCards = settingsCards.filter(
    (card) => !card.permission || hasPermission(card.permission),
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {visibleCards.map((card) => (
        <Link key={card.href} href={card.href}>
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <card.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}

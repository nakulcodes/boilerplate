'use client';

/**
 * DASHBOARD NAVIGATION
 *
 * Structure:
 * - Dashboard (top level)
 * - RECRUITING section
 *   - Jobs
 *   - Candidates
 *   - Reports (V1.1)
 * - SETTINGS section
 *   - Settings
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  HomeIcon,
  Cog6ToothIcon,
  BriefcaseIcon,
  UsersIcon,
  ChartBarIcon,
} from '@heroicons/react/24/solid';

interface Route {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  activeMatch?: (pathname: string) => boolean;
  section?: string;
}

export function DashboardNav() {
  const pathname = usePathname();

  const routes: Route[] = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: HomeIcon,
    },
    {
      href: '/dashboard/jobs',
      label: 'Jobs',
      icon: BriefcaseIcon,
      activeMatch: (p) => p.startsWith('/dashboard/jobs'),
      section: 'RECRUITING',
    },
    {
      href: '/dashboard/candidates',
      label: 'Candidates',
      icon: UsersIcon,
      activeMatch: (p) => p.startsWith('/dashboard/candidates'),
      section: 'RECRUITING',
    },
    {
      href: '/dashboard/reports',
      label: 'Reports',
      icon: ChartBarIcon,
      activeMatch: (p) => p.startsWith('/dashboard/reports'),
      section: 'RECRUITING',
    },
    {
      href: '/dashboard/settings',
      label: 'Settings',
      icon: Cog6ToothIcon,
      activeMatch: (p) => p.startsWith('/dashboard/settings'),
      section: 'SETTINGS',
    },
  ];

  const renderRoute = (route: Route) => {
    const isActive = route.activeMatch
      ? route.activeMatch(pathname)
      : pathname === route.href;

    return (
      <Link
        key={route.href}
        href={route.href}
        className={cn(
          'flex items-center w-full h-10 px-3 py-2 rounded-xl',
          isActive
            ? 'bg-white/70 text-gray-800 font-medium shadow-sm hover:shadow-xs border border-gray-200/80 border-b-2 border-b-gray-400/50 dark:bg-gradient-to-b dark:from-[#222327] dark:to-[#18191e] dark:border-none dark:text-gray-100'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-black/20 hover:text-gray-900 dark:hover:text-gray-100',
        )}
      >
        <route.icon className="mr-3 h-4 w-4 shrink-0" />
        <span className="text-sm">{route.label}</span>
      </Link>
    );
  };

  const dashboardRoute = routes.find((r) => !r.section);
  const recruitingRoutes = routes.filter((r) => r.section === 'RECRUITING');
  const settingsRoutes = routes.filter((r) => r.section === 'SETTINGS');

  return (
    <nav className="border-r border-border dark:border-border bg-gray-50/40 dark:bg-dark-background lg:w-72">
      <div className="flex flex-col h-full p-6">
        <div className="space-y-1.5 mb-6">
          <h2 className="text-2xl font-medium tracking-tight text-gray-900 dark:text-gray-100 px-3">
            ATS
          </h2>
          <p className="text-sm text-gray-500/90 dark:text-gray-400/90 px-3">
            Applicant Tracking System
          </p>
        </div>

        <div className="space-y-6 flex-1">
          {dashboardRoute && (
            <div className="space-y-2">{renderRoute(dashboardRoute)}</div>
          )}

          {recruitingRoutes.length > 0 && (
            <div className="space-y-2">
              <div className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Recruiting
              </div>
              {recruitingRoutes.map(renderRoute)}
            </div>
          )}

          {settingsRoutes.length > 0 && (
            <div className="space-y-2">
              <div className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Settings
              </div>
              {settingsRoutes.map(renderRoute)}
            </div>
          )}
        </div>

        <div className="mt-auto">
          <div className="pt-6 border-t border-border">
            <p className="text-xs text-gray-500 dark:text-gray-400 px-3">
              Boilerplate ATS
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  HomeIcon,
  CubeIcon,
  BuildingStorefrontIcon,
  UserIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  CircleStackIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  BoltIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";
import { usePermissions } from "@/hooks/use-permissions";
import { Permission } from "@/types/permissions.type";
import { useSession } from "@/contexts/session-context";
import { PERMISSIONS_ENUM } from "@/constants/permissions.constants";
import { ImpersonationBanner } from "@/components/auth/impersonation-banner";
export function DashboardNav() {
  const pathname = usePathname();
  const { user } = useSession();
  const { hasAnyPermission } = usePermissions();
  const routes = [
    {
      href: "/dashboard",
      label: "Overview",
      icon: HomeIcon,
      permissions: [] as Permission[], // Everyone can access dashboard
      showForNonEmpire: true,
    },
    {
      href: "/dashboard/products",
      label: "Products",
      icon: CubeIcon,
      permissions: [PERMISSIONS_ENUM.PRODUCT_LIST_READ] as Permission[],
      showForNonEmpire: false,
    },
    {
      href: "/dashboard/inventory",
      label: "Inventory",
      icon: ClipboardDocumentListIcon,
      permissions: [PERMISSIONS_ENUM.PRODUCT_LIST_READ] as Permission[],
      showForNonEmpire: true,
    },
    {
      href: "/dashboard/stores",
      label: "Stores",
      icon: BuildingStorefrontIcon,
      permissions: [PERMISSIONS_ENUM.STORE_LIST_READ] as Permission[],
      showForNonEmpire: true,
    },
    {
      href: "/dashboard/channels",
      label: "Channels",
      icon: CircleStackIcon,
      permissions: [PERMISSIONS_ENUM.CHANNEL_LIST_READ] as Permission[],
      showForNonEmpire: false,
    },
    {
      href: "/dashboard/partners",
      label: "Partners",
      icon: UserGroupIcon,
      permissions: [PERMISSIONS_ENUM.USER_LIST_READ] as Permission[],
      showForNonEmpire: false,
    },
    {
      href: "/dashboard/users",
      label: "Users",
      icon: UserIcon,
      permissions: [PERMISSIONS_ENUM.USER_LIST_READ] as Permission[],
      showForNonEmpire: true,
    },
    {
      href: "/dashboard/price-lists",
      label: "Price Lists",
      icon: ClipboardDocumentListIcon,
      permissions: [] as Permission[],
      showForNonEmpire: false,
    },
    {
      href: "/dashboard/prices",
      label: "Prices",
      icon: CurrencyDollarIcon,
      permissions: [] as Permission[],
      showForNonEmpire: true,
    },
    {
      href: "/dashboard/sync",
      label: "Sync Status",
      icon: ArrowPathIcon,
      permissions: [] as Permission[],
      showForNonEmpire: false,
    },
    {
      href: "/dashboard/logs",
      label: "Logs",
      icon: DocumentTextIcon,
      permissions: [PERMISSIONS_ENUM.SYSTEM_LOG_LIST] as Permission[],
      showForNonEmpire: false,
    },
    {
      href: "/dashboard/webhook-logs",
      label: "Webhook Logs",
      icon: BoltIcon,
      permissions: [PERMISSIONS_ENUM.WEBHOOK_LOG_LIST] as Permission[],
      showForNonEmpire: false,
    },
    {
      href: "/dashboard/cron-jobs",
      label: "Cron Monitoring",
      icon: ClockIcon,
      permissions: [PERMISSIONS_ENUM.CRON_MONITORING_READ] as Permission[],
      showForNonEmpire: false,
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: Cog6ToothIcon,
      permissions: [] as Permission[],
      showForNonEmpire: true,
    },
    {
      href: "/dashboard/admin/cleanup",
      label: "Admin Cleanup",
      icon: WrenchScrewdriverIcon,
      permissions: [] as Permission[],
      showForNonEmpire: false,
      requireEmpireAdmin: true,
    },
  ];

  return (
    <nav className="border-r border-border dark:border-border bg-gray-50/40 dark:bg-dark-background lg:w-72">
      <div className="flex flex-col h-full p-6">
        <div className="space-y-1.5 mb-6">
          <h2 className="text-2xl font-medium tracking-tight text-gray-900 dark:text-gray-100 px-3">
            Dashboard
          </h2>
          <p className="text-sm text-gray-500/90 dark:text-gray-400/90 px-3">
            Inventory Management
          </p>
        </div>
        <div className="space-y-2">
          {routes.map((route) => {
            const isEmpireAdmin = user?.isEmpireAccount && user?.role === "empire admin";
            const shouldShow =
              (route.permissions.length === 0 ||
                hasAnyPermission(route.permissions)) &&
              (user?.isEmpireAccount || route.showForNonEmpire) &&
              (!(route as any).requireEmpireAdmin || isEmpireAdmin);

            const isActive =
              route.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === route.href ||
                  pathname.startsWith(route.href + "/");

            return shouldShow ? (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center w-full h-10 px-3 py-2 rounded-xl",
                  isActive
                    ? "bg-white/70 text-gray-800 font-medium shadow-sm hover:shadow-xs border border-gray-200/80 border-b-2 border-b-gray-400/50 dark:bg-gradient-to-b dark:from-[#222327] dark:to-[#18191e] dark:border-none dark:text-gray-100"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-black/20 hover:text-gray-900 dark:hover:text-gray-100"
                )}
              >
                <route.icon className="mr-3 h-4 w-4 shrink-0" />
                <span className="text-sm">{route.label}</span>
              </Link>
            ) : null;
          })}
        </div>
        <div className="mt-auto">
          <ImpersonationBanner />
          <div className="pt-6 border-t border-border">
            <p className="text-xs text-gray-500 dark:text-gray-400 px-3">
              © 2024 Empire Imports
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
}

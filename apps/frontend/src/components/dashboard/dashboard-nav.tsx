"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  HomeIcon,
  Cog6ToothIcon,
  UserIcon,
} from "@heroicons/react/24/solid";

export function DashboardNav() {
  const pathname = usePathname();

  const routes = [
    {
      href: "/dashboard",
      label: "Overview",
      icon: HomeIcon,
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: Cog6ToothIcon,
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
            Manage your application
          </p>
        </div>
        <div className="space-y-2">
          {routes.map((route) => {
            const isActive =
              route.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === route.href ||
                  pathname.startsWith(route.href + "/");

            return (
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
            );
          })}
        </div>
        <div className="mt-auto">
          <div className="pt-6 border-t border-border">
            <p className="text-xs text-gray-500 dark:text-gray-400 px-3">
              Boilerplate App
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
}

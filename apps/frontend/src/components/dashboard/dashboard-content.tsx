"use client";

import { useSession } from "@/contexts/session-context";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useState } from "react";
import { type DashboardStats } from "@/components/dashboard/action";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface DashboardContentProps {
  initialStats: DashboardStats;
}

export function DashboardContent({ initialStats }: DashboardContentProps) {
  const { user } = useSession();
  const stats = initialStats;

  return (
    <div className="space-y-8 container mx-auto dark:text-dark-text">
      <div className="space-y-2">
        <h1 className="text-3xl font-medium tracking-tight ">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-muted-foreground  text-lg">
          Here&apos;s an overview of your{" "}
          {user?.isEmpireAccount ? "inventory" : "stores"} system
        </p>
      </div>
      {user?.isEmpireAccount && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="relative shadow-none overflow-hidden bg-white/50 dark:bg-dark-card border dark:border-gray-800/60 hover:dark:border-gray-700/50 transition-colors">
            <div className="p-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground ">
                  Total Products
                </h3>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold tracking-tight ">
                    {stats.totalProducts.toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground  mt-2">Active SKUs</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
          </Card>

          <Card className="relative shadow-none overflow-hidden bg-white/50 dark:bg-dark-card border dark:border-gray-800/60 hover:dark:border-gray-700/50 transition-colors">
            <div className="p-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground ">
                  Connected Stores
                </h3>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold tracking-tight ">
                    {stats.connectedStores}
                  </p>
                  <span
                    className={`text-sm font-medium ${
                      stats.connectedStores === stats.totalPlatforms
                        ? "text-green-500 dark:text-green-400"
                        : "text-amber-500 dark:text-amber-400"
                    }`}
                  >
                    / {stats.totalPlatforms} platforms
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground  mt-2">
                {stats.connectedStores === stats.totalPlatforms
                  ? "All systems operational"
                  : `${stats.totalPlatforms - stats.connectedStores} systems disconnected`}
              </p>
            </div>
            <div
              className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${
                stats.connectedStores === stats.totalPlatforms
                  ? "from-green-500 to-green-600"
                  : "from-amber-500 to-amber-600"
              }`}
            />
          </Card>

          <Card className="relative shadow-none overflow-hidden bg-white/50 dark:bg-dark-card border dark:border-gray-800/60 hover:dark:border-gray-700/50 transition-colors">
            <div className="p-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground ">
                  Connected Channels
                </h3>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold tracking-tight ">
                    {stats.pendingSyncs}
                  </p>
                  <span
                    className={`text-sm font-medium ${
                      stats.pendingSyncs === stats.channelStatuses.length
                        ? "text-green-500 dark:text-green-400"
                        : "text-amber-500 dark:text-amber-400"
                    }`}
                  >
                    / {stats.channelStatuses.length} channels
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground  mt-2">
                {stats.pendingSyncs === stats.channelStatuses.length
                  ? "All channels connected"
                  : `${stats.channelStatuses.length - stats.pendingSyncs} channels disconnected`}
              </p>
            </div>
            <div
              className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${
                stats.pendingSyncs === stats.channelStatuses.length
                  ? "from-green-500 to-green-600"
                  : "from-amber-500 to-amber-600"
              }`}
            />
          </Card>

          <Card className="relative shadow-none overflow-hidden bg-white/50 dark:bg-dark-card border dark:border-gray-800/60 hover:dark:border-gray-700/50 transition-colors">
            <div className="p-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground ">
                  Low Stock Items
                </h3>
                <div className="flex items-baseline gap-2">
                  <p
                    className={`text-3xl font-bold tracking-tight ${
                      stats.lowStockItems > 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {stats.lowStockItems}
                  </p>
                  {stats.lowStockItems > 0 && (
                    <span className="text-sm font-medium text-red-500 dark:text-red-400">
                      Urgent
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground  mt-2">
                {stats.lowStockItems === 0
                  ? "All stock levels healthy"
                  : "Below threshold"}
              </p>
            </div>
            <div
              className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${
                stats.lowStockItems > 0
                  ? "from-red-500 to-red-600"
                  : "from-green-500 to-green-600"
              }`}
            />
          </Card>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {user?.isEmpireAccount && (
          <Card className="shadow-none overflow-hidden bg-white/50 dark:bg-dark-card border dark:border-gray-800/60 hover:dark:border-gray-700/50 transition-colors">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold ">Connected Channels</h3>
                <Link
                  href="/dashboard/channels"
                  className="text-sm text-blue-500 hover:text-blue-400 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Manage channels
                </Link>
              </div>
              <Separator className="mb-4 dark:bg-gray-700/50" />
              <div className="space-y-4">
                {stats.channelStatuses.length > 0 ? (
                  stats.channelStatuses.map((channel) => (
                    <div
                      key={channel.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {channel.status === "passed" ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                        )}
                        <span className="text-sm font-medium ">
                          {channel.name}
                        </span>
                      </div>
                      <span
                        className={`text-sm ${
                          channel.status === "passed"
                            ? "text-green-600 dark:text-green-400"
                            : "text-yellow-600 dark:text-yellow-400"
                        }`}
                      >
                        {channel.status === "passed" ? "Connected" : "Failed"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      No channels available
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        <Card className="shadow-none overflow-hidden bg-white/50 dark:bg-dark-card border dark:border-gray-800/60 hover:dark:border-gray-700/50 transition-colors">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold ">Store Status</h3>
              <Link
                href="/dashboard/stores"
                className="text-sm text-blue-500 hover:text-blue-400 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Manage stores
              </Link>
            </div>
            <Separator className="mb-4 dark:bg-gray-700/50" />
            <div className="space-y-4">
              {stats.storeStatuses.length > 0 ? (
                stats.storeStatuses.map((store) => (
                  <div
                    key={store.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {store.status === "passed" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                      )}
                      <span className="text-sm font-medium ">{store.name}</span>
                    </div>
                    <span
                      className={`text-sm ${
                        store.status === "passed"
                          ? "text-green-600 dark:text-green-400"
                          : "text-yellow-600 dark:text-yellow-400"
                      }`}
                    >
                      {store.status === "passed" ? "Connected" : "Failed"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    No stores available
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

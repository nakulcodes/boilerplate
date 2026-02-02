"use client";

import { useSession } from "@/contexts/session-context";
import { Card } from "@/components/ui/card";

export function DashboardContent() {
  const { user } = useSession();

  return (
    <div className="space-y-8 container mx-auto dark:text-dark-text">
      <div className="space-y-2">
        <h1 className="text-3xl font-medium tracking-tight">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}!
        </h1>
        <p className="text-muted-foreground text-lg">
          Here&apos;s your dashboard overview
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="relative shadow-none overflow-hidden bg-white/50 dark:bg-dark-card border dark:border-gray-800/60 hover:dark:border-gray-700/50 transition-colors">
          <div className="p-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Organization
              </h3>
              <p className="text-lg font-semibold">
                {user?.organizationId ? "Connected" : "Not set"}
              </p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
        </Card>

        <Card className="relative shadow-none overflow-hidden bg-white/50 dark:bg-dark-card border dark:border-gray-800/60 hover:dark:border-gray-700/50 transition-colors">
          <div className="p-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Account
              </h3>
              <p className="text-lg font-semibold">
                {user?.email}
              </p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-600" />
        </Card>

        <Card className="relative shadow-none overflow-hidden bg-white/50 dark:bg-dark-card border dark:border-gray-800/60 hover:dark:border-gray-700/50 transition-colors">
          <div className="p-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Status
              </h3>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                Active
              </p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600" />
        </Card>
      </div>
    </div>
  );
}

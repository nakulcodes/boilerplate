'use client';

import { Button } from '@/components/ui/button';
import { useSession } from '@/contexts/session-context';
import { useImpersonation } from '@/hooks/use-impersonation';
import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export function DashboardHeader() {
  const { user, logout } = useSession();
  const { theme, setTheme } = useTheme();
  const { isImpersonating, stopImpersonation } = useImpersonation();

  return (
    <header className="border-b border-border dark:border-border bg-white dark:bg-dark-background dark:text-dark-text">
      {isImpersonating && (
        <div className="flex items-center justify-between bg-amber-500 px-6 py-2 text-sm font-medium text-black">
          <span>You are impersonating {user?.firstName || user?.email}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={stopImpersonation}
            className="h-7 border-black/30 bg-amber-400 text-black hover:bg-amber-300"
          >
            Exit Impersonation
          </Button>
        </div>
      )}
      <div className="flex h-16 items-center justify-between px-6 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Boilerplate
          </span>
        </div>

        <div className="flex items-center space-x-6">
          {user && (
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-zinc-900 dark:bg-zinc-700 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user.email[0].toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                {user.firstName || user.email}
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="relative h-7 w-14 rounded-full border border-transparent bg-zinc-100 dark:bg-zinc-800 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            <div className="absolute left-0 top-0 flex h-full w-full items-center justify-between px-1.5">
              <SunIcon className="h-3.5 w-3.5 text-zinc-800 dark:text-zinc-200" />
              <MoonIcon className="h-3.5 w-3.5 text-zinc-800 dark:text-zinc-200" />
            </div>
            <div
              suppressHydrationWarning
              className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm ring-1 ring-zinc-200/50 dark:ring-zinc-700/50 transition-transform duration-200 ease-in-out ${
                theme === 'dark' ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </Button>

          {user && (
            <Button
              variant="outline"
              onClick={logout}
              className="border-zinc-900 dark:border-zinc-700 bg-white dark:bg-gray-950 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-900 dark:hover:bg-zinc-700 hover:text-white transition-colors"
            >
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

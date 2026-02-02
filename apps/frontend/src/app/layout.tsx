'use client';

import './globals.css';
import { SessionProvider } from '@/contexts/session-context';
import { DM_Sans } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Boilerplate App</title>
        <meta name="description" content="Boilerplate App" />
      </head>
      <body
        className={`${dmSans.variable} dark:text-dark-text antialiased font-dmSans`}
      >
        <ThemeProvider>
          <SessionProvider>{children}</SessionProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

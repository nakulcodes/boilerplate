import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/contexts/session-context";
import { DM_Sans } from "next/font/google";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/utils/auth";
import { JWTPayload } from "@/types/user.type";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Inventory App",
  description: "Inventory App",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialUser = getUserFromToken(
    (await cookies()).get("token")?.value || ""
  ) as JWTPayload | null;

  const sessionKey = initialUser
    ? `session-${initialUser.user_id}-${initialUser.partnerId}`
    : "no-session";

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} dark:text-dark-text antialiased font-dmSans`}
      >
        <ThemeProvider>
          <SessionProvider key={sessionKey} initialUser={initialUser}>
            {children}
          </SessionProvider>{" "}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

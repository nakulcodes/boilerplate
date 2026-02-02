import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen font-dmSans bg-gray-50/10 dark:bg-dark-background flex flex-col">
      <DashboardHeader />
      <div className="flex   flex-1">
        <DashboardNav />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}

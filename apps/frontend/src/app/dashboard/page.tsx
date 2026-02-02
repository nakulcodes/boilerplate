import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { getDashboardStats } from "@/components/dashboard/action";

export const dynamic = "force-dynamic";
export const revalidate = 10;

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return <DashboardContent initialStats={stats} />;
}

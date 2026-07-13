import { AppShell } from "@/components/app-shell";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getCustomers } from "@/lib/pipeline/queries";
import { getOpenActivities } from "@/lib/activities/queries";
import { STAGES } from "@/lib/pipeline/data";
import { buildDashboard } from "@/lib/dashboard/data";

export default async function DashboardPage() {
  const [customers, activities] = await Promise.all([
    getCustomers(),
    getOpenActivities(),
  ]);
  const stats = buildDashboard(customers, STAGES, activities);
  return (
    <AppShell>
      <DashboardView stats={stats} />
    </AppShell>
  );
}

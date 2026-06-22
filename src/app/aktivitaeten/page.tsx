import { AppShell } from "@/components/app-shell";
import { ActivityList } from "@/components/activities/activity-list";
import { getOpenActivities } from "@/lib/activities/queries";

export default async function AktivitaetenPage() {
  const rows = await getOpenActivities();
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Aktivitäten</h1>
          <p className="text-sm text-muted-foreground">
            Alle offenen Aktivitäten nach Fälligkeit – überfällig zuerst. Klick
            auf einen Kunden öffnet seine Akte.
          </p>
        </div>

        <ActivityList rows={rows} />
      </div>
    </AppShell>
  );
}

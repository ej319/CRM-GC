import Link from "next/link";
import { Users, TrendingUp, Trophy, BellRing } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEuro, type DashboardStats } from "@/lib/dashboard/data";

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        <div className="rounded-lg bg-muted p-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

/** Dashboard-Ansicht: Kennzahlen + Pipeline pro Phase (rein, serverseitig). */
export function DashboardView({ stats }: { stats: DashboardStats }) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Überblick über deine Pipeline und offene Aktivitäten.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          icon={TrendingUp}
          label="Pipeline-Wert / Monat"
          value={formatEuro(stats.pipelineValue)}
          hint={`${stats.activeCustomers} aktive Aufträge`}
        />
        <Kpi icon={Users} label="Kunden gesamt" value={String(stats.totalCustomers)} />
        <Kpi
          icon={Trophy}
          label="Gewonnen"
          value={String(stats.wonCount)}
          hint={stats.lostCount > 0 ? `${stats.lostCount} verloren` : undefined}
        />
        <Kpi
          icon={BellRing}
          label="Fällige Aktivitäten"
          value={String(stats.dueCount)}
          hint={`${stats.openActivities} offen gesamt`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pipeline nach Phase</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {stats.perStage.map((s) => {
            const pct =
              stats.maxStageCount > 0 ? (s.count / stats.maxStageCount) * 100 : 0;
            return (
              <div key={s.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    {s.name}
                  </span>
                  <span className="text-muted-foreground">
                    {s.count} · {formatEuro(s.value)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: s.color }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/" className="underline underline-offset-2 hover:text-foreground">
          Zum Pipeline-Board
        </Link>
      </p>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Phone,
  MapPin,
  FileText,
  RotateCcw,
  MessageSquare,
  CalendarClock,
  Check,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { dueStatus, formatDue, type Activity } from "@/lib/activities/data";

export interface ActivityRow extends Activity {
  customerName: string;
}

const TYPE_ICONS: Record<string, typeof Phone> = {
  Anruf: Phone,
  "Termin vor Ort": MapPin,
  "Angebot machen": FileText,
  Nachfassen: RotateCcw,
  "Feedback-Gespräch": MessageSquare,
};

const DUE_COLOR = {
  overdue: "text-red-600",
  today: "text-green-600",
  future: "text-slate-500",
} as const;

const FILTERS = [
  { key: "all", label: "Alle" },
  { key: "overdue", label: "Überfällig" },
  { key: "today", label: "Heute" },
  { key: "future", label: "Zukunft" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

function Rows({
  rows,
  onComplete,
}: {
  rows: ActivityRow[];
  onComplete: (id: string) => void;
}) {
  if (rows.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Keine Aktivitäten.
      </p>
    );
  }
  return (
    <ul className="divide-y">
      {rows.map((row) => {
        const Icon = TYPE_ICONS[row.type] ?? CalendarClock;
        const status = dueStatus(row.dueDate);
        return (
          <li key={row.id} className="flex items-center gap-3 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {row.type} ·{" "}
                <Link
                  href={`/kunde/${row.customerId}`}
                  className="text-primary hover:underline"
                >
                  {row.customerName}
                </Link>
              </p>
              <p className={cn("text-xs", DUE_COLOR[status])}>
                fällig: {formatDue(row.dueDate, row.dueTime)}
                {row.note ? ` · ${row.note}` : ""}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-green-600"
              onClick={() => onComplete(row.id)}
              aria-label="Aktivität abhaken"
            >
              <Check className="h-4 w-4" />
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

/** Zentrale Aktivitätenliste: offene Aktivitäten nach Fälligkeit, mit Filtern. */
export function ActivityList({ initialRows }: { initialRows: ActivityRow[] }) {
  const [rows, setRows] = useState<ActivityRow[]>(initialRows);

  const sorted = useMemo(
    () =>
      rows
        .slice()
        .sort((a, b) =>
          (a.dueDate + (a.dueTime ?? "")).localeCompare(
            b.dueDate + (b.dueTime ?? ""),
          ),
        ),
    [rows],
  );

  function filtered(key: FilterKey): ActivityRow[] {
    if (key === "all") return sorted;
    return sorted.filter((r) => dueStatus(r.dueDate) === key);
  }

  function complete(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
    toast.success("Aktivität abgehakt (Vorschau).");
  }

  return (
    <Tabs defaultValue="all">
      <TabsList className="flex-wrap">
        {FILTERS.map((f) => (
          <TabsTrigger key={f.key} value={f.key}>
            {f.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {FILTERS.map((f) => (
        <TabsContent key={f.key} value={f.key} className="mt-4">
          <Rows rows={filtered(f.key)} onComplete={complete} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

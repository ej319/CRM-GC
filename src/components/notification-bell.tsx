"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { dueStatus, formatDue, type ActivityRow } from "@/lib/activities/data";

const MAX_SHOWN = 10;

/** Erinnerungs-Glocke: zeigt überfällige + heute fällige offene Aktivitäten. */
export function NotificationBell({ reminders }: { reminders: ActivityRow[] }) {
  const total = reminders.length;
  const shown = reminders.slice(0, MAX_SHOWN);
  const rest = total - shown.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-white hover:bg-white/10 hover:text-white"
          aria-label={`Erinnerungen${total > 0 ? ` (${total} fällig)` : ""}`}
        >
          <Bell className="h-5 w-5" />
          {total > 0 ? (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full px-1 text-[10px] leading-none"
            >
              {total > 99 ? "99+" : total}
            </Badge>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Fällige Aktivitäten</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {total === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            Keine fälligen Aktivitäten. 🎉
          </p>
        ) : (
          <>
            {shown.map((a) => {
              const overdue = dueStatus(a.dueDate) === "overdue";
              return (
                <DropdownMenuItem key={a.id} asChild>
                  <Link href={`/kunde/${a.customerId}`} className="flex flex-col items-start gap-0.5">
                    <span className="font-medium">{a.customerName}</span>
                    <span className="text-xs text-muted-foreground">
                      {a.type} ·{" "}
                      <span className={overdue ? "font-medium text-destructive" : ""}>
                        {overdue ? "überfällig: " : "heute: "}
                        {formatDue(a.dueDate, a.dueTime)}
                      </span>
                    </span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
            {rest > 0 ? (
              <p className="px-2 py-1 text-xs text-muted-foreground">und {rest} weitere …</p>
            ) : null}
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/aktivitaeten" className="justify-center text-sm">
            Alle Aktivitäten
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import { useState } from "react";
import {
  Phone,
  MapPin,
  FileText,
  RotateCcw,
  MessageSquare,
  CalendarClock,
  Check,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  dueStatus,
  formatDue,
  isOpen,
  type Activity,
} from "@/lib/activities/data";
import { ActivityForm, type ActivityFormValues } from "./activity-form";

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

interface ActivityItemProps {
  activity: Activity;
  onComplete: (id: string) => void;
  onEdit: (id: string, values: ActivityFormValues) => Promise<boolean>;
  onDelete: (id: string) => void;
}

/** Ein Aktivitäts-Eintrag im Verlauf / in der Liste. Offen = farbig + abhakbar; erledigt = abgehakt. */
export function ActivityItem({
  activity,
  onComplete,
  onEdit,
  onDelete,
}: ActivityItemProps) {
  const [editing, setEditing] = useState(false);
  const open = isOpen(activity);
  const Icon = TYPE_ICONS[activity.type] ?? CalendarClock;
  const status = open ? dueStatus(activity.dueDate) : null;

  if (editing) {
    return (
      <div className="rounded-md border p-3">
        <ActivityForm
          initial={{
            type: activity.type,
            dueDate: activity.dueDate,
            dueTime: activity.dueTime ?? "",
            note: activity.note ?? "",
          }}
          submitLabel="Speichern"
          onSubmit={async (values) => {
            const ok = await onEdit(activity.id, values);
            if (ok) setEditing(false);
            return ok;
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div
        className={cn(
          "mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          open ? "bg-muted text-foreground" : "bg-green-100 text-green-700",
        )}
      >
        {open ? <Icon className="h-4 w-4" /> : <Check className="h-4 w-4" />}
      </div>
      <div className="flex-1 rounded-md border p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium">{activity.type}</p>
            {open ? (
              <p className={cn("text-xs", status ? DUE_COLOR[status] : "")}>
                fällig: {formatDue(activity.dueDate, activity.dueTime)}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                erledigt am{" "}
                {activity.completedAt
                  ? new Date(activity.completedAt).toLocaleDateString("de-DE")
                  : "—"}{" "}
                · war fällig {formatDue(activity.dueDate, activity.dueTime)}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-1">
            {open ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-green-600"
                  onClick={() => onComplete(activity.id)}
                  aria-label="Aktivität abhaken"
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => setEditing(true)}
                  aria-label="Aktivität bearbeiten"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : null}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-destructive"
                  aria-label="Aktivität löschen"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Aktivität löschen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Diese Aktivität wird endgültig entfernt.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(activity.id)}>
                    Löschen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        {activity.note ? (
          <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
            {activity.note}
          </p>
        ) : null}
      </div>
    </div>
  );
}

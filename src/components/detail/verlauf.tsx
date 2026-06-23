"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NoteItem } from "./note-item";
import { ActivityItem } from "./activity-item";
import { EmailItem } from "./email-item";
import type { ActivityFormValues } from "./activity-form";
import { isOpen, type Activity } from "@/lib/activities/data";
import { VERLAUF_FILTERS, type Note } from "@/lib/notes/data";
import type { Email } from "@/lib/email/data";

interface VerlaufProps {
  notes: Note[];
  onEditNote: (id: string, body: string) => Promise<boolean>;
  onDeleteNote: (id: string) => void;
  activities: Activity[];
  onCompleteActivity: (id: string) => void;
  onEditActivity: (id: string, values: ActivityFormValues) => Promise<boolean>;
  onDeleteActivity: (id: string) => void;
  emails: Email[];
}

function sortActivities(activities: Activity[]): Activity[] {
  const open = activities
    .filter(isOpen)
    .sort((a, b) =>
      (a.dueDate + (a.dueTime ?? "")).localeCompare(b.dueDate + (b.dueTime ?? "")),
    );
  const done = activities
    .filter((a) => !isOpen(a))
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));
  return [...open, ...done];
}

function NotesList({
  notes,
  onEditNote,
  onDeleteNote,
}: Pick<VerlaufProps, "notes" | "onEditNote" | "onDeleteNote">) {
  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <NoteItem key={note.id} note={note} onEdit={onEditNote} onDelete={onDeleteNote} />
      ))}
    </div>
  );
}

function ActivitiesList({
  activities,
  onCompleteActivity,
  onEditActivity,
  onDeleteActivity,
}: Pick<
  VerlaufProps,
  "activities" | "onCompleteActivity" | "onEditActivity" | "onDeleteActivity"
>) {
  return (
    <div className="space-y-4">
      {sortActivities(activities).map((activity) => (
        <ActivityItem
          key={activity.id}
          activity={activity}
          onComplete={onCompleteActivity}
          onEdit={onEditActivity}
          onDelete={onDeleteActivity}
        />
      ))}
    </div>
  );
}

function EmailsList({ emails }: Pick<VerlaufProps, "emails">) {
  return (
    <div className="space-y-4">
      {emails.map((email) => (
        <EmailItem key={email.id} email={email} />
      ))}
    </div>
  );
}

function Empty() {
  return (
    <p className="py-6 text-center text-sm text-muted-foreground">
      Noch keine Einträge.
    </p>
  );
}

function ComingSoon({ label }: { label: string }) {
  return (
    <p className="py-6 text-center text-sm text-muted-foreground">
      {label} – kommt bald.
    </p>
  );
}

/** Verlauf-Zeitleiste mit Filter-Reitern (Notizen + Aktivitäten; E-Mails/Dateien folgen). */
export function Verlauf(props: VerlaufProps) {
  const { notes, activities, emails } = props;
  const nothing =
    notes.length === 0 && activities.length === 0 && emails.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Verlauf</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="flex-wrap">
            {VERLAUF_FILTERS.map((f) => (
              <TabsTrigger key={f.key} value={f.key}>
                {f.label}
                {f.key === "notes" && notes.length > 0 ? ` (${notes.length})` : ""}
                {f.key === "activities" && activities.length > 0
                  ? ` (${activities.length})`
                  : ""}
                {f.key === "emails" && emails.length > 0
                  ? ` (${emails.length})`
                  : ""}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-4">
            {nothing ? (
              <Empty />
            ) : (
              <>
                <ActivitiesList {...props} />
                <EmailsList {...props} />
                <NotesList {...props} />
              </>
            )}
          </TabsContent>
          <TabsContent value="notes" className="mt-4">
            {notes.length === 0 ? <Empty /> : <NotesList {...props} />}
          </TabsContent>
          <TabsContent value="activities" className="mt-4">
            {activities.length === 0 ? <Empty /> : <ActivitiesList {...props} />}
          </TabsContent>
          <TabsContent value="emails" className="mt-4">
            {emails.length === 0 ? <Empty /> : <EmailsList {...props} />}
          </TabsContent>
          <TabsContent value="files">
            <ComingSoon label="Dateien (PROJ-13)" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { StickyNote, CalendarClock, Mail, Paperclip } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { todayInBerlin } from "@/lib/activities/data";
import { ActivityForm, type ActivityFormValues } from "./activity-form";

interface DetailComposerProps {
  onAddNote: (body: string) => Promise<boolean>;
  onAddActivity: (values: ActivityFormValues) => Promise<boolean>;
}

function ComingSoon({ label }: { label: string }) {
  return (
    <p className="py-6 text-center text-sm text-muted-foreground">
      {label} – kommt bald.
    </p>
  );
}

/** Anlege-Leiste oben: Notiz (aktiv) + Platzhalter-Reiter für Aktivität/E-Mail/Datei. */
export function DetailComposer({ onAddNote, onAddActivity }: DetailComposerProps) {
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const text = body.trim();
    if (!text) return;
    setSaving(true);
    const ok = await onAddNote(text);
    setSaving(false);
    if (ok) setBody("");
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs defaultValue="note">
          <TabsList>
            <TabsTrigger value="note">
              <StickyNote className="mr-1.5 h-4 w-4" /> Notiz
            </TabsTrigger>
            <TabsTrigger value="activity">
              <CalendarClock className="mr-1.5 h-4 w-4" /> Aktivität
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="mr-1.5 h-4 w-4" /> E-Mail
            </TabsTrigger>
            <TabsTrigger value="file">
              <Paperclip className="mr-1.5 h-4 w-4" /> Datei
            </TabsTrigger>
          </TabsList>

          <TabsContent value="note" className="mt-4 space-y-3">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Notiz schreiben …"
              className="min-h-24 bg-amber-50"
            />
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={!body.trim() || saving}>
                {saving ? "Speichern…" : "Speichern"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <ActivityForm
              initial={{ dueDate: todayInBerlin() }}
              submitLabel="Speichern"
              resetOnSuccess
              onSubmit={onAddActivity}
            />
          </TabsContent>
          <TabsContent value="email">
            <ComingSoon label="E-Mails (PROJ-7)" />
          </TabsContent>
          <TabsContent value="file">
            <ComingSoon label="Dateien anhängen (PROJ-13)" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

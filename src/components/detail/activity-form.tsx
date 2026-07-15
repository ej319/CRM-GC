"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ACTIVITY_TYPES } from "@/lib/activities/data";

export interface ActivityFormValues {
  type: string;
  dueDate: string;
  dueTime: string;
  note: string;
}

interface ActivityFormProps {
  initial?: Partial<ActivityFormValues>;
  submitLabel?: string;
  onSubmit: (values: ActivityFormValues) => Promise<boolean> | boolean;
  onCancel?: () => void;
  /** Nach erfolgreichem Speichern Felder leeren (für die Anlege-Leiste). */
  resetOnSuccess?: boolean;
}

/** Gemeinsames Formular zum Anlegen/Bearbeiten/Planen einer Aktivität. */
export function ActivityForm({
  initial,
  submitLabel = "Speichern",
  onSubmit,
  onCancel,
  resetOnSuccess,
}: ActivityFormProps) {
  const [type, setType] = useState<string>(initial?.type ?? ACTIVITY_TYPES[0]);
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? "");
  const [dueTime, setDueTime] = useState(initial?.dueTime ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  async function handleSubmit() {
    if (!type) {
      setError("Bitte einen Typ wählen.");
      return;
    }
    if (!dueDate) {
      setError("Bitte ein Datum wählen.");
      return;
    }
    setError(undefined);
    setSaving(true);
    const ok = await onSubmit({ type, dueDate, dueTime, note });
    setSaving(false);
    if (ok && resetOnSuccess) {
      setDueDate("");
      setDueTime("");
      setNote("");
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Typ</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTIVITY_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="due-date">Datum</Label>
            <DatePicker id="due-date" value={dueDate} onChange={setDueDate} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="due-time">Uhrzeit</Label>
            <Input
              id="due-time"
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="act-note">Notiz</Label>
        <Textarea
          id="act-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="min-h-16"
          placeholder="optional"
        />
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button variant="outline" size="sm" onClick={onCancel} disabled={saving}>
            Abbrechen
          </Button>
        ) : null}
        <Button size="sm" onClick={handleSubmit} disabled={saving || !dueDate}>
          {saving ? "Speichern…" : submitLabel}
        </Button>
      </div>
    </div>
  );
}

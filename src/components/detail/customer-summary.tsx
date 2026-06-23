"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORY_COLORS,
  CATEGORY_OPTIONS,
  SOURCE_OPTIONS,
  STAGES,
  type Customer,
  type StageId,
} from "@/lib/pipeline/data";
import { updateCustomer, updateCustomerStage } from "@/lib/pipeline/actions";
import { PhoneLink } from "@/components/phone/phone-link";

function ReadRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm">{value && value.trim() ? value : "—"}</p>
    </div>
  );
}

/** Linke Spalte: kompakte Kundenübersicht mit „Bearbeiten"-Umschaltung. */
export function CustomerSummary({ customer }: { customer: Customer }) {
  const [data, setData] = useState<Customer>(customer);
  const [stageId, setStageId] = useState<StageId>(customer.stageId);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(toForm(customer));

  function toForm(c: Customer) {
    return {
      name: c.name,
      contactName: c.contactName ?? "",
      phone: c.phone ?? "",
      email: c.email ?? "",
      address: c.address ?? "",
      plz: c.plz ?? "",
      city: c.city ?? "",
      category: c.category ?? "",
      source: c.source ?? "",
      monthlyValue: c.monthlyValue?.toString() ?? "",
    };
  }

  function startEdit() {
    setForm(toForm(data));
    setEditing(true);
  }

  function set(key: keyof ReturnType<typeof toForm>, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Firmenname ist erforderlich");
      return;
    }
    const mv = form.monthlyValue.trim();
    if (mv && Number.isNaN(Number(mv.replace(",", ".")))) {
      toast.error("Monatswert muss eine Zahl sein");
      return;
    }
    setSaving(true);
    const res = await updateCustomer(data.id, {
      name: form.name,
      contactName: form.contactName,
      phone: form.phone,
      email: form.email,
      address: form.address,
      plz: form.plz,
      city: form.city,
      category: form.category,
      source: form.source,
      monthlyValue: mv ? Number(mv.replace(",", ".")) : undefined,
    });
    setSaving(false);
    if (res.ok) {
      setData(res.data);
      setEditing(false);
      toast.success("Gespeichert");
    } else {
      toast.error(res.error);
    }
  }

  async function handleStageChange(value: string) {
    const newStage = value as StageId;
    const previous = stageId;
    setStageId(newStage);
    const res = await updateCustomerStage(data.id, newStage);
    if (res.ok) toast.success("Phase geändert");
    else {
      setStageId(previous);
      toast.error(res.error);
    }
  }

  const addressLine = [data.address, [data.plz, data.city].filter(Boolean).join(" ")]
    .filter((s) => s && s.trim())
    .join(", ");

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <CardTitle className="text-lg leading-tight">
          {editing ? "Kunde bearbeiten" : data.name}
        </CardTitle>
        {!editing ? (
          <Button variant="outline" size="sm" onClick={startEdit}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" /> Bearbeiten
          </Button>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Phase: jederzeit schnell änderbar */}
        <div className="space-y-1.5">
          <Label>Phase</Label>
          <Select value={stageId} onValueChange={handleStageChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAGES.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {editing ? (
          <div className="space-y-3">
            <Field id="s-name" label="Firmenname *" value={form.name} onChange={(v) => set("name", v)} />
            <Field id="s-contact" label="Ansprechpartner" value={form.contactName} onChange={(v) => set("contactName", v)} />
            <Field id="s-phone" label="Telefon" value={form.phone} onChange={(v) => set("phone", v)} />
            <Field id="s-email" label="E-Mail" value={form.email} onChange={(v) => set("email", v)} />
            <Field id="s-address" label="Adresse" value={form.address} onChange={(v) => set("address", v)} />
            <div className="grid grid-cols-2 gap-2">
              <Field id="s-plz" label="PLZ" value={form.plz} onChange={(v) => set("plz", v)} />
              <Field id="s-city" label="Ort" value={form.city} onChange={(v) => set("city", v)} />
            </div>
            <div className="space-y-1.5">
              <Label>Kategorie</Label>
              <Select value={form.category || undefined} onValueChange={(v) => set("category", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Wählen…" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Quelle</Label>
              <Select value={form.source || undefined} onValueChange={(v) => set("source", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Wählen…" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_OPTIONS.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Field id="s-value" label="Monatswert (€)" value={form.monthlyValue} onChange={(v) => set("monthlyValue", v)} />

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => setEditing(false)} disabled={saving}>
                Abbrechen
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? "Speichern…" : "Speichern"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {data.category ? (
              <span
                className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
                style={{ backgroundColor: CATEGORY_COLORS[data.category] ?? "#94a3b8" }}
              >
                {data.category}
              </span>
            ) : null}
            <ReadRow label="Ansprechpartner" value={data.contactName} />
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Telefon</p>
              <PhoneLink phone={data.phone} />
            </div>
            <ReadRow label="E-Mail" value={data.email} />
            <ReadRow label="Adresse" value={addressLine} />
            <ReadRow label="Quelle" value={data.source} />
            <ReadRow
              label="Monatswert"
              value={
                data.monthlyValue != null
                  ? `${data.monthlyValue.toLocaleString("de-DE")} €`
                  : undefined
              }
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  CATEGORY_OPTIONS,
  SOURCE_OPTIONS,
  STAGES,
  type Customer,
  type StageId,
} from "@/lib/pipeline/data";
import {
  deleteCustomer,
  updateCustomer,
  updateCustomerStage,
} from "@/lib/pipeline/actions";

export function CustomerDetail({ customer }: { customer: Customer | null }) {
  if (!customer) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <p className="text-muted-foreground">
          Dieser Kunde wurde nicht gefunden (vielleicht wurde er gelöscht).
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/">Zurück zum Board</Link>
        </Button>
      </div>
    );
  }
  return <CustomerDetailForm customer={customer} />;
}

function CustomerDetailForm({ customer }: { customer: Customer }) {
  const [form, setForm] = useState({
    name: customer.name,
    contactName: customer.contactName ?? "",
    phone: customer.phone ?? "",
    email: customer.email ?? "",
    address: customer.address ?? "",
    plz: customer.plz ?? "",
    city: customer.city ?? "",
    category: customer.category ?? "",
    source: customer.source ?? "",
    monthlyValue: customer.monthlyValue?.toString() ?? "",
  });
  const [stageId, setStageId] = useState<StageId>(customer.stageId);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function set(key: keyof typeof form, value: string) {
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
    const res = await updateCustomer(customer.id, {
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
    if (res.ok) toast.success("Gespeichert");
    else toast.error(res.error);
  }

  async function handleStageChange(value: string) {
    const newStage = value as StageId;
    const previous = stageId;
    setStageId(newStage);
    const res = await updateCustomerStage(customer.id, newStage);
    if (res.ok) toast.success("Phase geändert");
    else {
      setStageId(previous);
      toast.error(res.error);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await deleteCustomer(customer.id);
    if (res.ok) {
      toast.success("Kunde gelöscht");
      window.location.href = "/";
    } else {
      setDeleting(false);
      toast.error(res.error);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/">
            <ArrowLeft className="mr-1 h-4 w-4" /> Board
          </Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={deleting}>
              <Trash2 className="mr-1 h-4 w-4" /> Löschen
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Kunde löschen?</AlertDialogTitle>
              <AlertDialogDescription>
                „{customer.name}" wird endgültig gelöscht. Das lässt sich nicht
                rückgängig machen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Löschen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <h1 className="text-2xl font-semibold">{form.name || customer.name}</h1>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Kundendaten</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="d-name">Firmenname *</Label>
              <Input
                id="d-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
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
            <TextField
              id="d-contact"
              label="Ansprechpartner"
              value={form.contactName}
              onChange={(v) => set("contactName", v)}
            />
            <TextField
              id="d-phone"
              label="Telefon"
              value={form.phone}
              onChange={(v) => set("phone", v)}
            />
            <TextField
              id="d-email"
              label="E-Mail"
              value={form.email}
              onChange={(v) => set("email", v)}
            />
            <TextField
              id="d-value"
              label="Monatswert (€)"
              value={form.monthlyValue}
              onChange={(v) => set("monthlyValue", v)}
            />
            <div className="space-y-1.5">
              <Label>Kategorie</Label>
              <Select
                value={form.category || undefined}
                onValueChange={(v) => set("category", v)}
              >
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
              <Select
                value={form.source || undefined}
                onValueChange={(v) => set("source", v)}
              >
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
            <TextField
              id="d-address"
              label="Adresse"
              value={form.address}
              onChange={(v) => set("address", v)}
            />
            <TextField
              id="d-plz"
              label="PLZ"
              value={form.plz}
              onChange={(v) => set("plz", v)}
            />
            <TextField
              id="d-city"
              label="Ort"
              value={form.city}
              onChange={(v) => set("city", v)}
            />
          </CardContent>
          <div className="flex justify-end px-6 pb-6">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Speichern…" : "Speichern"}
            </Button>
          </div>
        </Card>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Verlauf</CardTitle>
            <CardDescription>
              Notizen, Aktivitäten und E-Mails erscheinen hier – kommt in
              PROJ-4.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Noch nichts vorhanden.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TextField({
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

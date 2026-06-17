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
import { SAMPLE_CUSTOMERS, STAGES, type StageId } from "@/lib/pipeline/data";

function notImplemented() {
  toast.info(
    "Das Speichern wird mit der Datenbank im nächsten Schritt (/backend) aktiv.",
  );
}

export function CustomerDetail({ customerId }: { customerId: string }) {
  const customer = SAMPLE_CUSTOMERS.find((c) => c.id === customerId);
  const [stageId, setStageId] = useState<StageId>(
    customer?.stageId ?? "kalter_kontakt",
  );

  if (!customer) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <p className="text-muted-foreground">
          Dieser Kunde ist in der Vorschau nicht hinterlegt. In dieser Version
          gibt es nur Beispiel-Kunden – die echte Speicherung kommt mit dem
          nächsten Schritt (/backend).
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/">Zurück zum Board</Link>
        </Button>
      </div>
    );
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
            <Button variant="destructive" size="sm">
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
              <AlertDialogAction onClick={notImplemented}>
                Löschen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <h1 className="text-2xl font-semibold">{customer.name}</h1>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Kundendaten</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Firmenname" value={customer.name} />
            <div className="space-y-1.5">
              <Label>Phase</Label>
              <Select
                value={stageId}
                onValueChange={(v) => {
                  setStageId(v as StageId);
                  notImplemented();
                }}
              >
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
            <Field label="Ansprechpartner" value={customer.contactName ?? ""} />
            <Field label="Telefon" value={customer.phone ?? ""} />
            <Field label="E-Mail" value={customer.email ?? ""} />
            <Field
              label="Monatswert (€)"
              value={customer.monthlyValue?.toString() ?? ""}
            />
            <Field label="Kategorie" value={customer.category ?? ""} />
            <Field label="Quelle" value={customer.source ?? ""} />
            <Field label="Adresse" value={customer.address ?? ""} />
            <Field label="PLZ" value={customer.plz ?? ""} />
            <Field label="Ort" value={customer.city ?? ""} />
          </CardContent>
          <div className="flex justify-end px-6 pb-6">
            <Button onClick={notImplemented}>Speichern</Button>
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
            <p className="text-sm text-muted-foreground">Noch nichts vorhanden.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input defaultValue={value} />
    </div>
  );
}

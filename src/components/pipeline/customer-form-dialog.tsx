"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORY_OPTIONS, SOURCE_OPTIONS } from "@/lib/pipeline/data";

const schema = z.object({
  name: z.string().trim().min(1, "Firmenname ist erforderlich"),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z
    .union([z.string().email("Ungültige E-Mail"), z.literal("")])
    .optional(),
  address: z.string().optional(),
  plz: z.string().optional(),
  city: z.string().optional(),
  category: z.string().optional(),
  source: z.string().optional(),
  monthlyValue: z
    .string()
    .optional()
    .refine(
      (v) => !v || !Number.isNaN(Number(v.replace(",", "."))),
      "Bitte eine Zahl eingeben",
    ),
});

type FormValues = z.infer<typeof schema>;

export interface CustomerFormValues {
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  plz?: string;
  city?: string;
  category?: string;
  source?: string;
  monthlyValue?: number;
}

const EMPTY: FormValues = {
  name: "",
  contactName: "",
  phone: "",
  email: "",
  address: "",
  plz: "",
  city: "",
  category: "",
  source: "",
  monthlyValue: "",
};

export function CustomerFormDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CustomerFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  useEffect(() => {
    if (open) reset(EMPTY);
  }, [open, reset]);

  function submit(v: FormValues) {
    const clean = (s?: string) => {
      const t = (s ?? "").trim();
      return t === "" ? undefined : t;
    };
    onSubmit({
      name: v.name.trim(),
      contactName: clean(v.contactName),
      phone: clean(v.phone),
      email: clean(v.email),
      address: clean(v.address),
      plz: clean(v.plz),
      city: clean(v.city),
      category: clean(v.category),
      source: clean(v.source),
      monthlyValue:
        v.monthlyValue && v.monthlyValue.trim() !== ""
          ? Number(v.monthlyValue.replace(",", "."))
          : undefined,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Neuer Kunde</DialogTitle>
          <DialogDescription>
            Nur der Firmenname ist Pflicht – alles andere kannst du später
            ergänzen.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(submit)}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">Firmenname *</Label>
            <Input id="name" {...register("name")} />
            {errors.name ? (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contactName">Ansprechpartner</Label>
            <Input id="contactName" {...register("contactName")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Telefon</Label>
            <Input id="phone" {...register("phone")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">E-Mail</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email ? (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="monthlyValue">Monatswert (€)</Label>
            <Input
              id="monthlyValue"
              inputMode="decimal"
              {...register("monthlyValue")}
            />
            {errors.monthlyValue ? (
              <p className="text-xs text-destructive">
                {errors.monthlyValue.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label>Kategorie</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
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
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Quelle</Label>
            <Controller
              control={control}
              name="source"
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
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
              )}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" {...register("address")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="plz">PLZ</Label>
            <Input id="plz" {...register("plz")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">Ort</Label>
            <Input id="city" {...register("city")} />
          </div>

          <DialogFooter className="sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button type="submit">Speichern</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

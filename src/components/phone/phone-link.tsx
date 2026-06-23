"use client";

import { Phone } from "lucide-react";

import { cn } from "@/lib/utils";
import { toDialNumber } from "@/lib/phone/format";
import { useCallScheme } from "./call-scheme";

interface PhoneLinkProps {
  phone?: string | null;
  className?: string;
}

/**
 * Einheitlicher Telefon-Link: macht eine Nummer per tel:/callto: anklickbar
 * (Schema aus der geräte-lokalen Einstellung). Ohne wählbare Nummer nur Text.
 */
export function PhoneLink({ phone, className }: PhoneLinkProps) {
  const { scheme } = useCallScheme();

  if (!phone || !phone.trim()) {
    return <span className={cn("text-sm", className)}>—</span>;
  }

  const dial = toDialNumber(phone);
  if (!dial) {
    return <span className={cn("text-sm", className)}>{phone}</span>;
  }

  return (
    <a
      href={`${scheme}:${dial}`}
      className={cn(
        "inline-flex items-center gap-1 text-sm text-primary hover:underline",
        className,
      )}
      aria-label={`${phone} anrufen`}
    >
      <Phone className="h-3.5 w-3.5 shrink-0" />
      {phone}
    </a>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { checkInboundEmails } from "@/lib/inbound/actions";

/**
 * Prüft beim Öffnen des CRM still im Hintergrund, ob neue Anfrage-Mails
 * eingegangen sind (serverseitig auf max. alle 5 Minuten gedrosselt).
 * Zeigt nur etwas an, wenn tatsächlich neue Kunden angelegt wurden.
 */
export function InboundAutoCheck() {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    checkInboundEmails()
      .then((res) => {
        if (res.ok && res.data.created > 0) {
          toast.success(
            `${res.data.created} neue Anfrage(n) automatisch als Kunde angelegt.`,
          );
          router.refresh();
        }
      })
      .catch(() => {
        // still scheitern – der Nutzer kann jederzeit „Jetzt prüfen" nutzen.
      });
  }, [router]);

  return null;
}

"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

/** Zeigt nach der Rückkehr vom Gmail-Verbinden eine kurze Rückmeldung (über ?gmail=…). */
export function GmailResultToast() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const flag = params.get("gmail");
    if (!flag) return;

    switch (flag) {
      case "connected":
        toast.success("Gmail verbunden. Du kannst jetzt E-Mails senden.");
        break;
      case "denied":
        toast.info("Gmail-Verbindung abgebrochen.");
        break;
      case "not_configured":
        toast.error("Gmail ist noch nicht eingerichtet (Zugangsdaten fehlen).");
        break;
      default:
        toast.error("Gmail-Verbindung fehlgeschlagen. Bitte erneut versuchen.");
    }

    const url = new URL(window.location.href);
    url.searchParams.delete("gmail");
    router.replace(url.pathname + (url.search ? url.search : ""));
  }, [params, router]);

  return null;
}

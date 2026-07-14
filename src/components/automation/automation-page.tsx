"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { setRuleEnabled } from "@/lib/automation/actions";
import { checkInboundEmails, setInboundLabel } from "@/lib/inbound/actions";
import { RULES, type RuleKey } from "@/lib/automation/data";

export function AutomationPage({
  initial,
  inboundLabel,
  lastCheck,
}: {
  initial: Record<string, boolean>;
  inboundLabel: string;
  lastCheck: string | null;
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState<Record<string, boolean>>(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [label, setLabel] = useState(inboundLabel);
  const [savingLabel, setSavingLabel] = useState(false);
  const [checking, setChecking] = useState(false);
  const [needsReconnect, setNeedsReconnect] = useState(false);

  async function toggle(key: RuleKey, next: boolean) {
    setBusy(key);
    const prev = enabled[key];
    setEnabled((e) => ({ ...e, [key]: next }));
    const res = await setRuleEnabled(key, next);
    setBusy(null);
    if (!res.ok) {
      setEnabled((e) => ({ ...e, [key]: prev }));
      toast.error(res.error);
      return;
    }
    toast.success(next ? "Automatik aktiviert." : "Automatik ausgeschaltet.");
  }

  async function saveLabel() {
    setSavingLabel(true);
    const res = await setInboundLabel(label);
    setSavingLabel(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Label gespeichert.");
  }

  async function checkNow() {
    setChecking(true);
    const res = await checkInboundEmails(true);
    setChecking(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    if (res.data.needsReconnect) {
      setNeedsReconnect(true);
      toast.error("Gmail muss einmal neu verbunden werden (Lese-Erlaubnis fehlt).");
      return;
    }
    setNeedsReconnect(false);
    if (res.data.created > 0) {
      toast.success(`${res.data.created} neue Anfrage(n) als Kunde angelegt.`);
      router.refresh();
    } else {
      toast.success("Keine neuen Anfragen gefunden.");
    }
  }

  const inboundOn = enabled["inbound_email_to_lead"] ?? false;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Automatik</h1>
        <p className="text-sm text-muted-foreground">
          Regeln, die dir Arbeit abnehmen. Du kannst sie hier ein- und ausschalten.
        </p>
      </div>

      {needsReconnect ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Gmail neu verbinden</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              Zum Lesen eingehender Anfragen braucht das CRM einmalig die
              Lese-Erlaubnis für dein Postfach.
            </p>
            <Button asChild size="sm">
              <a href="/api/gmail/connect?next=/automatik">Gmail neu verbinden</a>
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-3">
        {RULES.map((rule) => {
          const isOn = enabled[rule.key] ?? false;
          return (
            <Card key={rule.key}>
              <CardContent className="space-y-3 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="mt-0.5 rounded-lg bg-muted p-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{rule.title}</p>
                        {!rule.active ? <Badge variant="secondary">Neu</Badge> : null}
                      </div>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={isOn}
                    disabled={busy === rule.key}
                    onCheckedChange={(v) => toggle(rule.key, v)}
                    aria-label={`${rule.title} umschalten`}
                  />
                </div>

                {rule.key === "inbound_email_to_lead" ? (
                  <div className="space-y-3 rounded-md border bg-muted/40 p-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="inbound-label">Gmail-Label für Anfragen</Label>
                      <div className="flex gap-2">
                        <Input
                          id="inbound-label"
                          value={label}
                          onChange={(e) => setLabel(e.target.value)}
                          placeholder="CRM-Anfrage"
                        />
                        <Button
                          variant="outline"
                          onClick={saveLabel}
                          disabled={savingLabel || !label.trim()}
                        >
                          {savingLabel ? "Speichern …" : "Speichern"}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Richte in Gmail einen Filter ein, der Anfrage-Mails automatisch
                        mit diesem Label versieht. Das CRM prüft dann nur diese Mails.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">
                        {lastCheck
                          ? `Zuletzt geprüft: ${new Date(lastCheck).toLocaleString("de-DE")}`
                          : "Noch nie geprüft."}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={checkNow}
                        disabled={checking || !inboundOn}
                      >
                        <RefreshCw
                          className={`mr-1.5 h-4 w-4 ${checking ? "animate-spin" : ""}`}
                        />
                        {checking ? "Prüfe …" : "Jetzt prüfen"}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

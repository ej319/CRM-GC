"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { setRuleEnabled } from "@/lib/automation/actions";
import { RULES, type RuleKey } from "@/lib/automation/data";

export function AutomationPage({ initial }: { initial: Record<string, boolean> }) {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(initial);
  const [busy, setBusy] = useState<string | null>(null);

  async function toggle(key: RuleKey, next: boolean) {
    setBusy(key);
    const prev = enabled[key];
    setEnabled((e) => ({ ...e, [key]: next })); // optimistisch
    const res = await setRuleEnabled(key, next);
    setBusy(null);
    if (!res.ok) {
      setEnabled((e) => ({ ...e, [key]: prev }));
      toast.error(res.error);
      return;
    }
    toast.success(next ? "Automatik aktiviert." : "Automatik ausgeschaltet.");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Automatik</h1>
        <p className="text-sm text-muted-foreground">
          Regeln, die dir Arbeit abnehmen. Du kannst sie hier ein- und ausschalten.
        </p>
      </div>

      <div className="space-y-3">
        {RULES.map((rule) => {
          const isOn = enabled[rule.key] ?? false;
          return (
            <Card key={rule.key}>
              <CardContent className="flex items-start justify-between gap-4 py-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 rounded-lg bg-muted p-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{rule.title}</p>
                      {!rule.active ? (
                        <Badge variant="secondary">Geplant</Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">{rule.description}</p>
                  </div>
                </div>
                <Switch
                  checked={rule.active ? isOn : false}
                  disabled={!rule.active || busy === rule.key}
                  onCheckedChange={(v) => toggle(rule.key, v)}
                  aria-label={`${rule.title} ${isOn ? "ausschalten" : "einschalten"}`}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

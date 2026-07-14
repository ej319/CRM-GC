import { AppShell } from "@/components/app-shell";
import { AutomationPage } from "@/components/automation/automation-page";
import { getAutomationRules } from "@/lib/automation/queries";
import { getInboundLabel, getInboundLastCheck } from "@/lib/inbound/queries";

export default async function AutomatikRoute() {
  const [rules, label, lastCheck] = await Promise.all([
    getAutomationRules(),
    getInboundLabel(),
    getInboundLastCheck(),
  ]);
  return (
    <AppShell>
      <AutomationPage initial={rules} inboundLabel={label} lastCheck={lastCheck} />
    </AppShell>
  );
}

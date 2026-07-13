import { AppShell } from "@/components/app-shell";
import { AutomationPage } from "@/components/automation/automation-page";
import { getAutomationRules } from "@/lib/automation/queries";

export default async function AutomatikRoute() {
  const rules = await getAutomationRules();
  return (
    <AppShell>
      <AutomationPage initial={rules} />
    </AppShell>
  );
}

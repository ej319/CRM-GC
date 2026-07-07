import { AppShell } from "@/components/app-shell";
import { TemplatesPage } from "@/components/templates/templates-page";
import { getTemplates } from "@/lib/templates/queries";

export default async function VorlagenPage() {
  const templates = await getTemplates();
  return (
    <AppShell>
      <TemplatesPage initial={templates} />
    </AppShell>
  );
}

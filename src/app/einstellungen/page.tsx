import { AppShell } from "@/components/app-shell";
import { SignatureEditor } from "@/components/settings/signature-editor";
import { getSignature } from "@/lib/signature/queries";

export default async function EinstellungenPage() {
  const sig = await getSignature();
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Einstellungen</h1>
          <p className="text-sm text-muted-foreground">
            Deine persönlichen Einstellungen.
          </p>
        </div>
        <SignatureEditor initialHtml={sig.bodyHtml} />
      </div>
    </AppShell>
  );
}

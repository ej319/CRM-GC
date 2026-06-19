import { AppShell } from "@/components/app-shell";
import { ImportWizard } from "@/components/import/import-wizard";
import { ImportHistory } from "@/components/import/import-history";

export default function ImportPage() {
  // Der Import-Verlauf wird mit dem Backend mit echten Daten gefüllt.
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Daten importieren</h1>
          <p className="text-sm text-muted-foreground">
            Lade eine Excel- oder CSV-Datei hoch (z.B. deinen Pipedrive-Export)
            und übernimm deine Kunden gesammelt ins CRM.
          </p>
        </div>

        <ImportWizard />
        <ImportHistory runs={[]} />
      </div>
    </AppShell>
  );
}

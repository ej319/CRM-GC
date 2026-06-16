import { KanbanSquare } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight">
          Willkommen im CRM
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Dein Arbeitsbereich. Hier entsteht als Nächstes deine Pipeline.
        </p>
        <Card className="mt-6 border-dashed">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <KanbanSquare className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">
                Pipeline (kommt in PROJ-2)
              </CardTitle>
              <CardDescription>
                Dieser Bereich wird bald dein Kanban-Board mit Kunden und
                Aufträgen.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>
    </AppShell>
  );
}

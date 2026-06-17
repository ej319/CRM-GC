import { TriangleAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoginCard } from "@/components/login-card";

const ERROR_MESSAGES: Record<string, string> = {
  not_allowed:
    "Dieser Zugang ist nicht freigeschaltet. Bitte wende dich an den Administrator.",
  auth: "Die Anmeldung ist fehlgeschlagen. Bitte versuche es erneut.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message = error ? ERROR_MESSAGES[error] ?? ERROR_MESSAGES.auth : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary">CRM</h1>
          <p className="text-sm text-muted-foreground">G+C Facility GmbH</p>
        </div>
        {message ? (
          <Alert variant="destructive">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Anmeldung nicht möglich</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}
        <LoginCard />
      </div>
    </main>
  );
}

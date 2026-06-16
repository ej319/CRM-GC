import { UserMenu } from "@/components/user-menu";

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Grund-Gerüst der angemeldeten Ansicht: obere Leiste mit Logo + Nutzer-Menü,
 * darunter der Inhaltsbereich.
 */
export function AppShell({ children }: AppShellProps) {
  // TODO(PROJ-1 /backend): Echten angemeldeten Nutzer aus der Supabase-Session laden.
  const user = {
    name: "Ewgeni Jussufov",
    email: "ej@gc-facility.de",
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary">CRM</span>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            G+C Facility GmbH
          </span>
        </div>
        <UserMenu name={user.name} email={user.email} />
      </header>
      <main className="flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}

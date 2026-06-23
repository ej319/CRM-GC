import { redirect } from "next/navigation";

import { UserMenu } from "@/components/user-menu";
import { CallSchemeProvider } from "@/components/phone/call-scheme";
import { createClient } from "@/lib/supabase/server";

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Grund-Gerüst der angemeldeten Ansicht: obere Leiste mit Logo + Nutzer-Menü,
 * darunter der Inhaltsbereich. Lädt den echten angemeldeten Nutzer.
 */
export async function AppShell({ children }: AppShellProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  // Kein Profil = nicht freigeschaltet -> zurück zur Login-Seite.
  if (!profile) {
    redirect("/login?error=not_allowed");
  }

  const displayName = profile.full_name || profile.email;

  return (
    <CallSchemeProvider>
      <div className="flex min-h-screen flex-col bg-muted/40">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">CRM</span>
            <span className="hidden text-sm text-muted-foreground sm:inline">
              G+C Facility GmbH
            </span>
          </div>
          <UserMenu
            name={displayName}
            email={profile.email}
            avatarUrl={profile.avatar_url || undefined}
          />
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </CallSchemeProvider>
  );
}

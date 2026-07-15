import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LifeBuoy } from "lucide-react";

import { MainNav } from "@/components/main-nav";
import { UserMenu } from "@/components/user-menu";
import { NotificationBell } from "@/components/notification-bell";
import { FeedbackDialog } from "@/components/feedback/feedback-dialog";
import { InboundAutoCheck } from "@/components/automation/inbound-auto-check";
import { Button } from "@/components/ui/button";
import { CallSchemeProvider } from "@/components/phone/call-scheme";
import { GmailResultToast } from "@/components/gmail-result-toast";
import { createClient } from "@/lib/supabase/server";
import { getOpenActivities } from "@/lib/activities/queries";
import { dueReminders } from "@/lib/activities/data";

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

  const reminders = dueReminders(await getOpenActivities());

  return (
    <CallSchemeProvider>
      <Suspense fallback={null}>
        <GmailResultToast />
      </Suspense>
      <InboundAutoCheck />
      <div className="flex min-h-screen flex-col bg-muted/40">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-2 border-b border-white/10 bg-[#1a1d29] px-3 text-white sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              className="shrink-0 rounded bg-primary px-2 py-0.5 text-sm font-bold tracking-tight text-primary-foreground"
            >
              CRM
            </Link>
            <MainNav />
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <FeedbackDialog
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Hilfe & Feedback"
                  className="text-white hover:bg-white/10 hover:text-white"
                >
                  <LifeBuoy className="h-5 w-5" />
                </Button>
              }
            />
            <NotificationBell reminders={reminders} />
            <UserMenu
              name={displayName}
              email={profile.email}
              avatarUrl={profile.avatar_url || undefined}
            />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </CallSchemeProvider>
  );
}

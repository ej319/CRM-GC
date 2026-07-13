import { AppShell } from "@/components/app-shell";
import { FeedbackPage } from "@/components/feedback/feedback-page";
import { getTickets } from "@/lib/feedback/queries";

export default async function FeedbackRoute() {
  const tickets = await getTickets();
  return (
    <AppShell>
      <FeedbackPage initial={tickets} />
    </AppShell>
  );
}

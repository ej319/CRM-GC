import { AppShell } from "@/components/app-shell";
import { CustomerDetail } from "@/components/pipeline/customer-detail";
import { getCustomer } from "@/lib/pipeline/queries";
import { getNotes } from "@/lib/notes/queries";
import { getCustomerActivities } from "@/lib/activities/queries";
import { getEmails } from "@/lib/email/queries";
import { getStatus } from "@/lib/email/gmail";

export default async function KundePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomer(id);
  const notes = customer ? await getNotes(id) : [];
  const activities = customer ? await getCustomerActivities(id) : [];
  const emails = customer ? await getEmails(id) : [];
  const gmail = await getStatus();
  return (
    <AppShell>
      <CustomerDetail
        customer={customer}
        initialNotes={notes}
        initialActivities={activities}
        initialEmails={emails}
        gmailConnected={gmail.connected}
        gmailEmail={gmail.email}
      />
    </AppShell>
  );
}

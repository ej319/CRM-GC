import { AppShell } from "@/components/app-shell";
import { CustomerDetail } from "@/components/pipeline/customer-detail";
import { getCustomer } from "@/lib/pipeline/queries";
import { getNotes } from "@/lib/notes/queries";
import { getCustomerActivities } from "@/lib/activities/queries";

export default async function KundePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomer(id);
  const notes = customer ? await getNotes(id) : [];
  const activities = customer ? await getCustomerActivities(id) : [];
  return (
    <AppShell>
      <CustomerDetail
        customer={customer}
        initialNotes={notes}
        initialActivities={activities}
      />
    </AppShell>
  );
}

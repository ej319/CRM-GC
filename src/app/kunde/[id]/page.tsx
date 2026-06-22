import { AppShell } from "@/components/app-shell";
import { CustomerDetail } from "@/components/pipeline/customer-detail";
import { getCustomer } from "@/lib/pipeline/queries";
import { getNotes } from "@/lib/notes/queries";

export default async function KundePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomer(id);
  const notes = customer ? await getNotes(id) : [];
  return (
    <AppShell>
      <CustomerDetail customer={customer} initialNotes={notes} />
    </AppShell>
  );
}

import { AppShell } from "@/components/app-shell";
import { CustomerDetail } from "@/components/pipeline/customer-detail";
import { getCustomer } from "@/lib/pipeline/queries";

export default async function KundePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomer(id);
  return (
    <AppShell>
      <CustomerDetail customer={customer} />
    </AppShell>
  );
}

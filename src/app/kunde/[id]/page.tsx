import { AppShell } from "@/components/app-shell";
import { CustomerDetail } from "@/components/pipeline/customer-detail";

export default async function KundePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppShell>
      <CustomerDetail customerId={id} />
    </AppShell>
  );
}

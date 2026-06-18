import { AppShell } from "@/components/app-shell";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { getCustomers } from "@/lib/pipeline/queries";

export default async function Home() {
  const customers = await getCustomers();
  return (
    <AppShell>
      <PipelineBoard initialCustomers={customers} />
    </AppShell>
  );
}

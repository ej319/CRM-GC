import { AppShell } from "@/components/app-shell";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";

export default function Home() {
  return (
    <AppShell>
      <PipelineBoard />
    </AppShell>
  );
}

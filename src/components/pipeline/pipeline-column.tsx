"use client";

import { useDroppable } from "@dnd-kit/core";

import { cn } from "@/lib/utils";
import { CustomerCard } from "@/components/pipeline/customer-card";
import type { Customer, Stage } from "@/lib/pipeline/data";

export function PipelineColumn({
  stage,
  customers,
}: {
  stage: Stage;
  customers: Customer[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div className="flex min-h-0 min-w-[180px] flex-1 flex-col px-2">
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: stage.color }}
          />
          <h2 className="truncate text-sm font-semibold">{stage.name}</h2>
        </div>
        <span className="ml-1 shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {customers.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto rounded-md p-1.5 transition-colors",
          isOver && "bg-primary/10",
        )}
      >
        {customers.map((customer) => (
          <CustomerCard key={customer.id} customer={customer} />
        ))}
      </div>
    </div>
  );
}

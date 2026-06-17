"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PipelineColumn } from "@/components/pipeline/pipeline-column";
import { CustomerCardView } from "@/components/pipeline/customer-card";
import {
  CustomerFormDialog,
  type CustomerFormValues,
} from "@/components/pipeline/customer-form-dialog";
import {
  SAMPLE_CUSTOMERS,
  STAGES,
  sortCustomers,
  type Customer,
  type SortKey,
  type StageId,
} from "@/lib/pipeline/data";

export function PipelineBoard() {
  const [customers, setCustomers] = useState<Customer[]>(SAMPLE_CUSTOMERS);
  const [sortKey, setSortKey] = useState<SortKey>("last_activity");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const targetStage = over.id as StageId;
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? { ...c, stageId: targetStage, updatedAt: new Date().toISOString() }
          : c,
      ),
    );
  }

  function handleCreate(values: CustomerFormValues) {
    const newCustomer: Customer = {
      id: crypto.randomUUID(),
      stageId: "kalter_kontakt",
      updatedAt: new Date().toISOString(),
      lastActivityAt: null,
      activityStatus: "none",
      ...values,
    };
    setCustomers((prev) => [newCustomer, ...prev]);
  }

  const activeCustomer = customers.find((c) => c.id === activeId) ?? null;

  if (customers.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <Header sortKey={sortKey} onSort={setSortKey} onAdd={() => setCreateOpen(true)} />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="text-muted-foreground">Noch keine Kunden.</p>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus /> Neuer Kunde
          </Button>
        </div>
        <CustomerFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSubmit={handleCreate}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Header sortKey={sortKey} onSort={setSortKey} onAdd={() => setCreateOpen(true)} />
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              customers={sortCustomers(
                customers.filter((c) => c.stageId === stage.id),
                sortKey,
              )}
            />
          ))}
        </div>
        <DragOverlay>
          {activeCustomer ? <CustomerCardView customer={activeCustomer} /> : null}
        </DragOverlay>
      </DndContext>
      <CustomerFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />
    </div>
  );
}

function Header({
  sortKey,
  onSort,
  onAdd,
}: {
  sortKey: SortKey;
  onSort: (key: SortKey) => void;
  onAdd: () => void;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h1 className="text-xl font-semibold">Pipeline</h1>
      <div className="flex items-center gap-2">
        <Select value={sortKey} onValueChange={(v) => onSort(v as SortKey)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Sortieren" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last_activity">Letzte Aktivität</SelectItem>
            <SelectItem value="alpha">Alphabetisch</SelectItem>
            <SelectItem value="value">Auftragswert</SelectItem>
            <SelectItem value="category">Kategorie</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={onAdd}>
          <Plus /> Neuer Kunde
        </Button>
      </div>
    </div>
  );
}

"use client";

import { forwardRef } from "react";
import { useDraggable } from "@dnd-kit/core";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ActivityMarker } from "@/components/pipeline/activity-marker";
import { CATEGORY_COLORS, type Customer } from "@/lib/pipeline/data";

type ViewProps = React.HTMLAttributes<HTMLDivElement> & {
  customer: Customer;
  dragging?: boolean;
};

/** Reine Darstellung der Karte (ohne Drag-Logik) – auch für die Drag-Vorschau. */
export const CustomerCardView = forwardRef<HTMLDivElement, ViewProps>(
  ({ customer, dragging, className, ...props }, ref) => (
    <Card
      ref={ref}
      className={cn(
        "cursor-pointer touch-none select-none p-3 shadow-sm transition-shadow hover:shadow-md",
        dragging && "opacity-50",
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold leading-tight">
          {customer.name}
        </span>
        <ActivityMarker status={customer.activityStatus ?? "none"} />
      </div>
      {customer.city ? (
        <p className="mt-0.5 text-xs text-muted-foreground">{customer.city}</p>
      ) : null}
      <div className="mt-2 flex items-center justify-between gap-2">
        {customer.category ? (
          <span
            className="rounded px-1.5 py-0.5 text-[11px] font-medium text-white"
            style={{
              backgroundColor: CATEGORY_COLORS[customer.category] ?? "#94a3b8",
            }}
          >
            {customer.category}
          </span>
        ) : (
          <span />
        )}
        {typeof customer.monthlyValue === "number" ? (
          <span className="text-xs font-medium text-muted-foreground">
            {customer.monthlyValue.toLocaleString("de-DE")} €
          </span>
        ) : null}
      </div>
    </Card>
  ),
);
CustomerCardView.displayName = "CustomerCardView";

/** Ziehbare Karte auf dem Board. Klick (ohne Ziehen) öffnet die Detailseite. */
export function CustomerCard({ customer }: { customer: Customer }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: customer.id });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <CustomerCardView
      ref={setNodeRef}
      customer={customer}
      dragging={isDragging}
      style={style}
      onClick={() => window.open(`/kunde/${customer.id}`, "_blank")}
      {...listeners}
      {...attributes}
    />
  );
}

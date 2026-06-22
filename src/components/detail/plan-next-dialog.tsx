"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActivityForm, type ActivityFormValues } from "./activity-form";

interface PlanNextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string;
  defaultDate: string;
  onPlan: (values: ActivityFormValues) => Promise<boolean>;
}

/** Öffnet sich nach dem Abhaken: bittet, die nächste Aktivität zu planen (überspringbar). */
export function PlanNextDialog({
  open,
  onOpenChange,
  customerName,
  defaultDate,
  onPlan,
}: PlanNextDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nächste Aktivität planen</DialogTitle>
          <DialogDescription>
            Für {customerName}. Du kannst überspringen, wenn nichts ansteht –
            dann erscheint das gelbe Warndreieck am Kunden.
          </DialogDescription>
        </DialogHeader>
        <ActivityForm
          initial={{ dueDate: defaultDate }}
          submitLabel="Aktivität planen"
          onSubmit={async (values) => {
            const ok = await onPlan(values);
            if (ok) onOpenChange(false);
            return ok;
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

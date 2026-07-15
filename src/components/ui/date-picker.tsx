"use client";

import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { todayInBerlin } from "@/lib/activities/data";

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
function ymd(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}
/** „YYYY-MM-DD" → „DD.MM.YYYY" für die Anzeige. */
function display(value: string): string {
  const [y, m, d] = value.split("-");
  return y && m && d ? `${d}.${m}.${y}` : "";
}

interface DatePickerProps {
  value: string; // "YYYY-MM-DD" oder ""
  onChange: (value: string) => void;
  id?: string;
  className?: string;
}

/** Datumsauswahl mit Kalender (heute grau markiert, Auswahl grün). */
export function DatePicker({ value, onChange, id, className }: DatePickerProps) {
  const today = todayInBerlin();
  const [open, setOpen] = useState(false);

  const base = value || today;
  const [by, bm] = base.split("-").map(Number);
  const [view, setView] = useState({ y: by, m: bm - 1 });

  const firstDow = (new Date(Date.UTC(view.y, view.m, 1)).getUTCDay() + 6) % 7; // Mo=0
  const daysInMonth = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();

  function move(delta: number) {
    const d = new Date(Date.UTC(view.y, view.m + delta, 1));
    setView({ y: d.getUTCFullYear(), m: d.getUTCMonth() });
  }
  function pick(day: number) {
    onChange(ymd(view.y, view.m, day));
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn("w-full justify-start font-normal", !value && "text-muted-foreground", className)}
        >
          <CalendarDays className="mr-2 h-4 w-4 shrink-0" />
          {value ? display(value) : "Datum wählen"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="mb-2 flex items-center justify-between">
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => move(-1)} aria-label="Vorheriger Monat">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {MONTHS[view.m]} {view.y}
          </span>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => move(1)} aria-label="Nächster Monat">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center text-xs text-muted-foreground">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-1">{w}</div>
          ))}
          {Array.from({ length: firstDow }).map((_, i) => (
            <div key={`b${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = ymd(view.y, view.m, day);
            const isToday = dateStr === today;
            const isSelected = dateStr === value;
            return (
              <button
                key={day}
                type="button"
                onClick={() => pick(day)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md text-sm text-foreground transition-colors hover:bg-muted",
                  isToday && !isSelected && "bg-muted font-semibold text-foreground ring-1 ring-inset ring-border",
                  isSelected && "bg-primary font-semibold text-primary-foreground hover:bg-primary",
                )}
                aria-label={display(dateStr)}
                aria-current={isToday ? "date" : undefined}
              >
                {day}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between border-t pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              const [ty, tm] = today.split("-").map(Number);
              setView({ y: ty, m: tm - 1 });
              onChange(today);
              setOpen(false);
            }}
          >
            Heute
          </Button>
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Löschen
            </Button>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}

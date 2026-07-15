"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  LayoutDashboard,
  CalendarClock,
  FileText,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Pipeline", icon: LayoutGrid },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/aktivitaeten", label: "Aktivitäten", icon: CalendarClock },
  { href: "/vorlagen", label: "Vorlagen", icon: FileText },
  { href: "/automatik", label: "Automatik", icon: Zap },
];

/** Hauptnavigation in der Kopfzeile – auf jeder Seite sichtbar. */
export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-0.5 overflow-x-auto">
      {ITEMS.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm transition-colors",
              active
                ? "bg-white/15 font-medium text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="hidden md:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

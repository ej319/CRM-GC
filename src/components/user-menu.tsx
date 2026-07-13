"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarClock, LogOut, Upload, FileText, Settings, LifeBuoy } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCallScheme, type CallScheme } from "@/components/phone/call-scheme";
import { createClient } from "@/lib/supabase/client";

interface UserMenuProps {
  name: string;
  email: string;
  avatarUrl?: string;
}

export function UserMenu({ name, email, avatarUrl }: UserMenuProps) {
  const [loading, setLoading] = useState(false);
  const { scheme, setScheme } = useCallScheme();

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleLogout() {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch {
      toast.error("Abmelden fehlgeschlagen. Bitte erneut versuchen.");
      setLoading(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full p-0"
          aria-label="Nutzer-Menü"
        >
          <Avatar className="h-9 w-9">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="text-sm font-medium">{name}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/aktivitaeten">
            <CalendarClock className="mr-2 h-4 w-4" />
            Aktivitäten
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/vorlagen">
            <FileText className="mr-2 h-4 w-4" />
            E-Mail-Vorlagen
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/einstellungen">
            <Settings className="mr-2 h-4 w-4" />
            Einstellungen
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/feedback">
            <LifeBuoy className="mr-2 h-4 w-4" />
            Hilfe & Feedback
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/import">
            <Upload className="mr-2 h-4 w-4" />
            Daten importieren
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Anruf-Link (Placetel)
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={scheme}
          onValueChange={(v) => setScheme(v as CallScheme)}
        >
          <DropdownMenuRadioItem value="tel">tel:</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="callto">callto:</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} disabled={loading}>
          <LogOut className="mr-2 h-4 w-4" />
          {loading ? "Wird abgemeldet …" : "Abmelden"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

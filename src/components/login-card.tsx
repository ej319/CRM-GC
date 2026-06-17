"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GoogleIcon } from "@/components/google-icon";
import { createClient } from "@/lib/supabase/client";

export function LoginCard() {
  const [loading, setLoading] = useState(false);

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        toast.error("Anmeldung fehlgeschlagen. Bitte erneut versuchen.");
        setLoading(false);
      }
      // Bei Erfolg leitet der Browser automatisch zu Google weiter.
    } catch {
      toast.error("Anmeldung fehlgeschlagen. Bitte erneut versuchen.");
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm shadow-sm">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">Anmelden</CardTitle>
        <CardDescription>CRM der G+C Facility GmbH</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleGoogleLogin}
          disabled={loading}
          variant="outline"
          size="lg"
          className="w-full"
        >
          <GoogleIcon />
          {loading ? "Weiterleitung zu Google …" : "Mit Google anmelden"}
        </Button>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Zugang nur für freigeschaltete Konten der G+C Facility GmbH.
        </p>
      </CardContent>
    </Card>
  );
}

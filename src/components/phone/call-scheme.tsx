"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type CallScheme = "tel" | "callto";

const STORAGE_KEY = "crm.callScheme";

interface CallSchemeValue {
  scheme: CallScheme;
  setScheme: (scheme: CallScheme) => void;
}

const CallSchemeContext = createContext<CallSchemeValue>({
  scheme: "tel",
  setScheme: () => {},
});

/**
 * Hält das Anruf-Schema (tel:/callto:) geräte-lokal (Browser-Speicher) und
 * teilt es zwischen dem Umschalter im Nutzer-Menü und allen Telefon-Links.
 */
export function CallSchemeProvider({ children }: { children: ReactNode }) {
  const [scheme, setSchemeState] = useState<CallScheme>("tel");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "tel" || stored === "callto") setSchemeState(stored);
    } catch {
      // localStorage nicht verfügbar – Standard bleibt tel:
    }
  }, []);

  function setScheme(next: CallScheme) {
    setSchemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignorieren
    }
  }

  return (
    <CallSchemeContext.Provider value={{ scheme, setScheme }}>
      {children}
    </CallSchemeContext.Provider>
  );
}

export function useCallScheme() {
  return useContext(CallSchemeContext);
}

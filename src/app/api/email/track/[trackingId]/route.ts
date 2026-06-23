import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Unsichtbares transparentes 1×1-GIF.
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64",
);

/** Öffnungs-Tracking: setzt „geöffnet am" beim ersten Abruf und liefert den Pixel. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ trackingId: string }> },
) {
  const { trackingId } = await params;
  try {
    const admin = createAdminClient();
    await admin
      .from("emails")
      .update({ opened_at: new Date().toISOString() })
      .eq("tracking_id", trackingId)
      .is("opened_at", null);
  } catch {
    // Tracking ist „best effort" – Fehler dürfen das Bild nie blockieren.
  }

  return new NextResponse(new Uint8Array(PIXEL), {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Content-Length": String(PIXEL.length),
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      Pragma: "no-cache",
    },
  });
}

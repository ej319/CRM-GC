import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "email-images";

/**
 * Zeigt ein im privaten Bucket liegendes eigenes Bild an – nur für angemeldete
 * Nutzer. `key` ist der (kodierte) Speicherpfad, z. B. "uuid%2Flogo.png".
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return new NextResponse("Not configured", { status: 500 });
  }

  const { data: blob, error } = await admin.storage.from(BUCKET).download(key);
  if (error || !blob) return new NextResponse("Not found", { status: 404 });

  const buf = Buffer.from(await blob.arrayBuffer());
  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": blob.type || "application/octet-stream",
      "Cache-Control": "private, max-age=3600",
    },
  });
}

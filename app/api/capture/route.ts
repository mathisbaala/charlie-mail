import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { leadColumns, readLeadFields, type LeadFieldsPayload } from "@/lib/lead-fields";
import { checkRateLimit, getClientIp } from "@/lib/validation";

export const runtime = "nodejs";

/* Les mêmes huit champs que l'inscription à la newsletter, plus le document
   demandé. La lecture est partagée (`lib/lead-fields.ts`) : ces deux routes
   doivent recueillir exactement la même chose, sans quoi la fiche d'un abonné
   dépendrait de la porte qu'il a poussée. */
type CapturePayload = LeadFieldsPayload & {
  slug?: string;
  source?: string;
};

type DocumentRow = {
  slug: string;
  redirect_url: string;
};

function getValidatedRedirectUrl(value: string) {
  const redirectUrl = value.trim();
  if (!redirectUrl) return null;

  try {
    const parsedUrl = new URL(redirectUrl);
    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
      return null;
    }
    return redirectUrl;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  if (!checkRateLimit(getClientIp(request))) {
    return NextResponse.json(
      { ok: false, message: "Trop de demandes. Réessayez dans une minute." },
      { status: 429 }
    );
  }

  let body: CapturePayload;

  try {
    body = (await request.json()) as CapturePayload;
  } catch {
    return NextResponse.json({ ok: false, message: "Requête invalide." }, { status: 400 });
  }

  const slug = body.slug?.trim().toLowerCase();
  const champs = readLeadFields(body);

  if (!champs.ok) {
    return NextResponse.json({ ok: false, message: champs.message }, { status: 400 });
  }

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ ok: false, message: "Slug invalide." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json({ ok: false, message: "Supabase n'est pas configuré." }, { status: 500 });
  }

  const { data: document, error: documentError } = await supabase
    .from("documents")
    .select("slug, redirect_url")
    .eq("slug", slug)
    .maybeSingle<DocumentRow>();

  if (documentError || !document) {
    return NextResponse.json({ ok: false, message: "Document introuvable." }, { status: 404 });
  }

  const redirectUrl = getValidatedRedirectUrl(document.redirect_url);

  if (!redirectUrl) {
    return NextResponse.json(
      { ok: false, message: "URL de redirection invalide pour ce document." },
      { status: 500 }
    );
  }

  const source = body.source?.trim() || null;

  const { error: insertError } = await supabase.from("leads").insert({
    ...leadColumns(champs.fields),
    document_slug: document.slug,
    redirect_url: redirectUrl,
    source
  });

  if (insertError) {
    console.error("Failed to insert lead", insertError);
    return NextResponse.json({ ok: false, message: "Impossible d'enregistrer vos informations." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, redirectUrl });
}

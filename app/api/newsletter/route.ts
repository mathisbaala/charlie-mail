import { NextRequest, NextResponse } from "next/server";
import { branding } from "@/lib/config/branding";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { leadColumns, readLeadFields, type LeadFieldsPayload } from "@/lib/lead-fields";
import { checkRateLimit, getClientIp } from "@/lib/validation";

export const runtime = "nodejs";

const NEWSLETTER_SLUG = "newsletter";
const NEWSLETTER_SOURCE = "newsletter";

/* Huit champs depuis le 31/08/2026, sept exigés — voir `lib/qualification.ts`
   pour la décision. La lecture et la validation vivent dans `lib/lead-fields.ts`,
   partagées avec la route de téléchargement : deux copies pour huit champs
   auraient divergé, et une divergence ici donne deux fiches inégales pour la
   même personne selon la porte qu'elle a poussée. */
type NewsletterPayload = LeadFieldsPayload & {
  source?: string;
};

function getNewsletterRedirectUrl() {
  try {
    return new URL("/newsletter", branding.siteUrl).toString();
  } catch {
    return "https://charlie-mail.vercel.app/newsletter";
  }
}

export async function POST(request: NextRequest) {
  if (!checkRateLimit(getClientIp(request))) {
    return NextResponse.json(
      { ok: false, message: "Trop de demandes. Réessayez dans une minute." },
      { status: 429 }
    );
  }

  let body: NewsletterPayload;

  try {
    body = (await request.json()) as NewsletterPayload;
  } catch {
    return NextResponse.json({ ok: false, message: "Requête invalide." }, { status: 400 });
  }

  const champs = readLeadFields(body);

  if (!champs.ok) {
    return NextResponse.json({ ok: false, message: champs.message }, { status: 400 });
  }

  const { email } = champs.fields;

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json({ ok: false, message: "Supabase n'est pas configuré." }, { status: 500 });
  }

  const { data: existingLead, error: existingLeadError } = await supabase
    .from("leads")
    .select("id")
    .eq("document_slug", NEWSLETTER_SLUG)
    .eq("email", email)
    .maybeSingle<{ id: string }>();

  if (existingLeadError) {
    console.error("Failed to check newsletter lead", existingLeadError);
    return NextResponse.json({ ok: false, message: "Impossible d'enregistrer cet email." }, { status: 500 });
  }

  if (existingLead) {
    return NextResponse.json({ ok: true, alreadySubscribed: true });
  }

  const source = body.source?.trim() || NEWSLETTER_SOURCE;

  const { error: insertError } = await supabase.from("leads").insert({
    ...leadColumns(champs.fields),
    document_slug: NEWSLETTER_SLUG,
    redirect_url: getNewsletterRedirectUrl(),
    source
  });

  if (insertError) {
    console.error("Failed to insert newsletter lead", insertError);
    return NextResponse.json({ ok: false, message: "Impossible d'enregistrer cet email." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, alreadySubscribed: false });
}

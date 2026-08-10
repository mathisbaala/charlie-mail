import { NextRequest, NextResponse } from "next/server";
import { branding } from "@/lib/config/branding";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  JOB_TITLE_MAX_LENGTH,
  checkRateLimit,
  getClientIp,
  isAcceptableEmail,
  sanitizeName
} from "@/lib/validation";

export const runtime = "nodejs";

const NEWSLETTER_SLUG = "newsletter";
const NEWSLETTER_SOURCE = "newsletter";

type NewsletterPayload = {
  first_name?: string;
  last_name?: string;
  email?: string;
  job_title?: string;
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

  const firstName = sanitizeName(body.first_name);
  const lastName = sanitizeName(body.last_name);
  const email = String(body.email ?? "").trim().toLowerCase();
  const jobTitle = sanitizeName(body.job_title, JOB_TITLE_MAX_LENGTH);

  if (!firstName) {
    return NextResponse.json({ ok: false, message: "Prénom invalide." }, { status: 400 });
  }

  if (!lastName) {
    return NextResponse.json({ ok: false, message: "Nom invalide." }, { status: 400 });
  }

  if (!isAcceptableEmail(email)) {
    return NextResponse.json({ ok: false, message: "Email invalide." }, { status: 400 });
  }

  if (!jobTitle) {
    return NextResponse.json({ ok: false, message: "Métier invalide." }, { status: 400 });
  }

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
    first_name: firstName,
    last_name: lastName,
    email,
    job_title: jobTitle,
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

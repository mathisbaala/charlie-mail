// Retombe sur le défaut dès que la variable est absente, vide ou uniquement
// blanche. Un `?? default` laisse passer "" (variable définie mais vide) — ce
// qui faisait planter `new URL("")` dans app/layout.tsx au build.
const envOr = (value: string | undefined, fallback: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
};

const firstName = process.env.NEXT_PUBLIC_OWNER_FIRST_NAME?.trim();
const lastName = process.env.NEXT_PUBLIC_OWNER_LAST_NAME?.trim();
const fullName = process.env.NEXT_PUBLIC_OWNER_NAME?.trim();

const ownerNameFromParts = [firstName, lastName].filter(Boolean).join(" ").trim();

export const branding = {
  ownerName: fullName || ownerNameFromParts || "Mathis",
  ownerPhotoUrl: envOr(process.env.NEXT_PUBLIC_OWNER_PHOTO_URL, "/1759855646461.jpeg"),
  companyName: envOr(process.env.NEXT_PUBLIC_BRAND_NAME, "Charlie"),
  companyLogoUrl: envOr(process.env.NEXT_PUBLIC_BRAND_LOGO_URL, "/charlie-favicon-no-background.png"),
  siteUrl: envOr(process.env.NEXT_PUBLIC_SITE_URL, "http://localhost:3000"),

  // Prise de rendez-vous : NOTRE adresse, jamais celle de l'agenda.
  //
  // 🛑 NE PAS Y METTRE L'URL GOOGLE. Celle de la page de rendez-vous fait 140
  // caractères et porte l'identifiant du compte qui l'héberge ; elle meurt au
  // prochain changement d'outil, comme est morte l'adresse Calendly qu'on a
  // quittée le 27/08/2026. `/rdv` redirige côté landing (`app/rdv/route.ts`
  // dans charlie-landing-page-V2) et force `hl=fr`. Le prospectus, la
  // newsletter et le screener pointent tous là : c'est la même règle partout.
  bookingUrl: envOr(process.env.NEXT_PUBLIC_BOOKING_LINK, "https://www.charliefinance.fr/rdv")
};

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
  siteUrl: envOr(process.env.NEXT_PUBLIC_SITE_URL, "http://localhost:3000")
};

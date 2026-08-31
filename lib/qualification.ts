// Les champs de qualification demandés à l'inscription.
//
// ─────────────────────────────────────────────────────────────────────────────
// POURQUOI CE FICHIER EXISTE (31/08/2026)
//
// Jusqu'ici les deux formulaires de cette application demandaient quatre choses :
// prénom, nom, email, métier. Le site vitrine en demandait sept, le screener
// huit, et les trois écrivaient dans le même CRM. Une même personne inscrite à
// la newsletter puis passée par /contact produisait deux fiches inégales, et
// c'est cette disparité qui obligeait à rappeler pour compléter.
//
// Décision de Mathis, le 31/08/2026 : **partout où Charlie recueille des
// coordonnées, on demande les mêmes champs et on exige les mêmes.** Sept champs
// obligatoires — nom et prénom, email, société, téléphone, effectif, encours,
// plus le métier propre à cette application et au screener. Le profil LinkedIn
// est le seul facultatif.
//
// 🛑 LES TRANCHES SONT CELLES DE LA LANDING, MOT POUR MOT, ET CE N'EST PAS UN
//    HASARD DE RÉDACTION. Les trois applications alimentent la même colonne du
//    CRM, qui se filtre. Un vocabulaire maison ici — « 50-100M » contre « 50 à
//    100 M€ » là — donnerait deux valeurs pour une seule réalité, et le filtre
//    ne trouverait jamais la moitié des gens.
//
//    Source d'origine : `lib/waitlist/survey-questions.ts` dans
//    charlie-landing-page-V2, recopié à l'identique dans `app/src/lib/lead.ts`
//    de charlie-investissement. Les trois dépôts ne partagent pas de code : la
//    seule garde possible est cet avertissement. **Toute retouche d'un libellé
//    se fait DES TROIS CÔTÉS, le même jour.**

type Option = { value: string; label: string };

/** L'effectif de la structure. */
export const TEAM_SIZES: readonly Option[] = [
  { value: "Je travaille seul", label: "Je travaille seul" },
  { value: "2 à 5 personnes", label: "2 à 5 personnes" },
  { value: "6 à 10 personnes", label: "6 à 10 personnes" },
  { value: "11 à 25 personnes", label: "11 à 25 personnes" },
  { value: "26 à 50 personnes", label: "26 à 50 personnes" },
  { value: "Plus de 50 personnes", label: "Plus de 50 personnes" }
];

/** L'encours conseillé. */
export const AUM_RANGES: readonly Option[] = [
  { value: "Moins de 20 M€", label: "Moins de 20 M€" },
  { value: "20 à 50 M€", label: "20 à 50 M€" },
  { value: "50 à 100 M€", label: "50 à 100 M€" },
  { value: "100 à 300 M€", label: "100 à 300 M€" },
  { value: "300 M€ à 1 Md€", label: "300 M€ à 1 Md€" },
  { value: "Plus de 1 Md€", label: "Plus de 1 Md€" }
];

const TEAM_SIZE_VALUES = new Set(TEAM_SIZES.map((o) => o.value));
const AUM_VALUES = new Set(AUM_RANGES.map((o) => o.value));

export function isTeamSize(value: string): boolean {
  return TEAM_SIZE_VALUES.has(value);
}

export function isAumRange(value: string): boolean {
  return AUM_VALUES.has(value);
}

export const COMPANY_MAX_LENGTH = 120;
export const PHONE_MAX_LENGTH = 30;
const LINKEDIN_MAX_LENGTH = 300;

/**
 * Numéro plausible : des chiffres, et les séparateurs qu'on tape vraiment.
 *
 * Volontairement permissif — un numéro suisse, luxembourgeois ou noté
 * « 06 12 34 56 78 » doit passer tel quel. Ce qu'on écarte est le champ qu'on
 * remplit pour passer : « aaa », « ---- », « (0) ». Sur un champ obligatoire,
 * accepter n'importe quoi reviendrait à ne rien exiger du tout.
 *
 * Même règle que `isPhone` dans charlie-investissement.
 */
export function isPhoneLike(value: string): boolean {
  const v = value.trim();
  if (v.length < 6 || v.length > PHONE_MAX_LENGTH) return false;
  if (!/^[0-9+\-.()\s]+$/.test(v)) return false;
  return (v.match(/\d/g) ?? []).length >= 6;
}

/**
 * Adresse de profil LinkedIn plausible.
 *
 * On ne valide ni le protocole ni la forme exacte : les gens collent
 * « linkedin.com/in/… », « www.linkedin.com/in/… » ou l'URL complète. Le champ
 * étant FACULTATIF, ce qui n'est pas reconnu est écarté en silence plutôt que
 * de faire échouer l'inscription — perdre l'abonné coûterait plus cher que
 * perdre le profil.
 */
export function normalizeLinkedIn(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (v.length > LINKEDIN_MAX_LENGTH) return null;
  return /(^|\.|\/)linkedin\.com\/(in|pub|company)\//i.test(v) ? v : null;
}

/**
 * Découpe « Marie-Claire de la Fontaine » en prénom et nom.
 *
 * 🛑 LE FORMULAIRE NE DEMANDE PLUS QU'UN CHAMP, MAIS LA BASE EN GARDE DEUX, et
 * c'est délibéré. `leads.first_name` sert à personnaliser chaque envoi
 * (« Bonjour Marie-Claire ») et le script d'envoi le lit chaque lundi : fondre
 * les deux colonnes aurait demandé de reprendre la newsletter entière pour
 * gagner une case. Le formulaire, lui, s'aligne sur les deux autres
 * applications, qui ont toujours demandé le nom complet d'un seul geste.
 *
 * Le premier mot est le prénom, le reste est le nom. C'est faux pour les noms
 * composés inversés, et ça n'a pas d'importance : ce qu'on veut, c'est le mot
 * par lequel commencer un message. Un nom d'un seul mot devient le prénom, et
 * le nom reste vide plutôt que de recopier le même mot deux fois.
 *
 * La landing applique exactement le même découpage avant de relayer ici
 * (`features/waitlist/server/newsletter.ts`).
 */
export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

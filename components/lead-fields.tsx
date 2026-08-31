"use client";

// Les champs de coordonnées, écrits UNE FOIS pour les deux formulaires.
//
// ─────────────────────────────────────────────────────────────────────────────
// POURQUOI CE COMPOSANT EXISTE (31/08/2026)
//
// `newsletter-form.tsx` et `lead-capture-form.tsx` étaient deux copies du même
// formulaire, à la destination près : quatre champs identiques, la même
// validation, les mêmes classes. Ça tenait tant qu'il y avait quatre champs.
//
// Le 31/08, Mathis a décidé que partout où Charlie recueille des coordonnées —
// ici, sur la landing, sur le screener — on demande les mêmes champs et on
// exige les mêmes. Ils sont passés à huit. Recopier huit champs et sept
// validations dans deux fichiers, c'était garantir qu'ils divergeraient : et une
// divergence ici veut dire que la fiche d'une personne dépend de la porte
// qu'elle a poussée, ce que la décision visait précisément à supprimer.
//
// La règle : SEPT OBLIGATOIRES — nom et prénom, email, métier, société,
// téléphone, effectif, encours. Le profil LinkedIn est le seul facultatif.
// Le serveur revalide tout (`lib/lead-fields.ts`), un formulaire se contourne.

import { AUM_RANGES, TEAM_SIZES } from "@/lib/qualification";

export const OTHER_JOB_VALUE = "Autre";

const FINANCIAL_ADVISORY_JOB_FAMILIES = [
  {
    label: "Banque",
    jobs: ["Banquier privé", "Conseiller en financement"]
  },
  {
    label: "Assurance",
    jobs: ["Courtier en assurance", "Assureur", "Mutualiste", "Conseiller en protection sociale"]
  },
  {
    label: "Gestion",
    jobs: [
      "Conseiller en gestion de patrimoine",
      "Family office",
      "Gérant de fonds",
      "Conseiller en investissements financiers (CIF)",
      "Gestionnaire de portefeuille",
      "Conseiller en gestion de fortune",
      "Conseiller retraite et prévoyance"
    ]
  }
] as const;

export type LeadFieldValues = {
  fullName: string;
  email: string;
  jobTitle: string;
  customJobTitle: string;
  company: string;
  phone: string;
  teamSize: string;
  aum: string;
  linkedin: string;
};

export const EMPTY_LEAD_FIELDS: LeadFieldValues = {
  fullName: "",
  email: "",
  jobTitle: "",
  customJobTitle: "",
  company: "",
  phone: "",
  teamSize: "",
  aum: "",
  linkedin: ""
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Le premier champ fautif, dans l'ordre de l'affichage.
 *
 * L'ordre compte : signaler le dernier champ manquant quand il en manque trois
 * fait remonter et redescendre le formulaire trois fois. Rend `null` quand tout
 * est bon.
 */
export function validateLeadFields(values: LeadFieldValues): string | null {
  if (!values.fullName.trim()) return "Veuillez renseigner votre nom et prénom.";
  if (!values.email.trim()) return "Veuillez renseigner votre email.";
  if (!isValidEmail(values.email.trim())) return "Email invalide.";
  if (!values.jobTitle.trim()) return "Veuillez sélectionner votre métier.";
  if (values.jobTitle === OTHER_JOB_VALUE && !values.customJobTitle.trim()) {
    return "Veuillez préciser votre métier.";
  }
  if (!values.company.trim()) return "Veuillez renseigner le nom de votre société.";
  if (!values.phone.trim()) return "Veuillez renseigner votre téléphone.";
  if (!values.teamSize) return "Veuillez indiquer l'effectif de votre structure.";
  if (!values.aum) return "Veuillez indiquer l'encours conseillé.";
  return null;
}

/** Le corps JSON commun aux deux routes. */
export function leadFieldsBody(values: LeadFieldValues) {
  const jobTitle = values.jobTitle.trim();
  return {
    /* Un seul champ de nom, comme sur la landing et le screener. La base garde
       ses deux colonnes : c'est le serveur qui découpe (`splitFullName`). */
    full_name: values.fullName.trim(),
    email: values.email.trim().toLowerCase(),
    job_title:
      jobTitle === OTHER_JOB_VALUE ? values.customJobTitle.trim() : jobTitle,
    company: values.company.trim(),
    phone: values.phone.trim(),
    team_size: values.teamSize,
    aum: values.aum,
    linkedin: values.linkedin.trim()
  };
}

export type LeadFieldsStyles = {
  fieldHeightClass: string;
  fieldPaddingClass: string;
  fieldTextClass: string;
  selectRightPaddingClass: string;
  compact: boolean;
};

type LeadFieldsProps = {
  values: LeadFieldValues;
  onChange: (values: LeadFieldValues) => void;
  disabled?: boolean;
  styles: LeadFieldsStyles;
};

export function LeadFields({ values, onChange, disabled = false, styles }: LeadFieldsProps) {
  const { fieldHeightClass, fieldPaddingClass, fieldTextClass, selectRightPaddingClass, compact } =
    styles;

  const inputClass = `${fieldHeightClass} w-full min-w-0 rounded-lg border border-ink-200 bg-white px-4 ${fieldPaddingClass} ${fieldTextClass} text-ink-900 outline-none transition placeholder:text-ink-500/70 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20`;
  const selectClass = `${fieldHeightClass} w-full min-w-0 appearance-none truncate rounded-lg border border-ink-200 bg-white px-4 ${fieldPaddingClass} ${selectRightPaddingClass} ${fieldTextClass} text-ink-900 outline-none transition focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20`;
  const chevronClass = `pointer-events-none absolute right-4 top-1/2 ${compact ? "h-4 w-4" : "h-5 w-5"} -translate-y-1/2 text-ink-500`;

  function set<K extends keyof LeadFieldValues>(key: K, value: LeadFieldValues[K]) {
    onChange({ ...values, [key]: value });
  }

  function Chevron() {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={chevronClass}>
        <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <>
      {/* Un seul champ de nom depuis le 31/08 : la landing et le screener ont
          toujours demandé le nom complet d'un seul geste, et cette application
          était la seule à le couper en deux. Les colonnes `first_name` et
          `last_name` restent en base — le script d'envoi personnalise chaque
          message avec le prénom — c'est le serveur qui découpe. */}
      <input
        id="full_name"
        name="full_name"
        type="text"
        maxLength={160}
        autoComplete="name"
        placeholder="Nom et prénom"
        required
        disabled={disabled}
        value={values.fullName}
        onChange={(event) => set("fullName", event.target.value)}
        className={inputClass}
      />

      <input
        id="email"
        name="email"
        type="email"
        maxLength={254}
        inputMode="email"
        autoComplete="email"
        placeholder="vous@entreprise.com"
        required
        disabled={disabled}
        value={values.email}
        onChange={(event) => set("email", event.target.value)}
        className={inputClass}
      />

      <div className="relative">
        <select
          id="job_title"
          name="job_title"
          required
          disabled={disabled}
          value={values.jobTitle}
          onChange={(event) => {
            const selectedJob = event.target.value;
            onChange({
              ...values,
              jobTitle: selectedJob,
              customJobTitle: selectedJob === OTHER_JOB_VALUE ? values.customJobTitle : ""
            });
          }}
          className={selectClass}
        >
          <option value="">Sélectionnez votre métier</option>
          {FINANCIAL_ADVISORY_JOB_FAMILIES.map((family) => (
            <optgroup key={family.label} label={family.label}>
              {family.jobs.map((jobOption) => (
                <option key={jobOption} value={jobOption}>
                  {jobOption}
                </option>
              ))}
            </optgroup>
          ))}
          <option value={OTHER_JOB_VALUE}>{OTHER_JOB_VALUE}</option>
        </select>
        <Chevron />
      </div>

      {values.jobTitle === OTHER_JOB_VALUE ? (
        <input
          id="job_title_other"
          name="job_title_other"
          maxLength={120}
          type="text"
          placeholder="Précisez votre métier"
          required
          disabled={disabled}
          value={values.customJobTitle}
          onChange={(event) => set("customJobTitle", event.target.value)}
          className={inputClass}
        />
      ) : null}

      {/* Société et téléphone côte à côte, comme sur la landing : deux champs
          courts alignés se lisent comme une rangée, pas comme deux demandes. */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
        <input
          id="company"
          name="company"
          type="text"
          maxLength={120}
          autoComplete="organization"
          placeholder="Société"
          required
          disabled={disabled}
          value={values.company}
          onChange={(event) => set("company", event.target.value)}
          className={inputClass}
        />

        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          maxLength={30}
          autoComplete="tel"
          placeholder="06 12 34 56 78"
          required
          disabled={disabled}
          value={values.phone}
          onChange={(event) => set("phone", event.target.value)}
          className={inputClass}
        />
      </div>

      {/* Les deux tranches. Des listes et non des champs libres : « 300M »,
          « 300 millions » et « ~300 M€ » sont la même réponse écrite de trois
          façons, et la colonne du CRM cesse d'être filtrable. C'est aussi ce qui
          rend l'obligation supportable — on ne demande pas un chiffre exact, qui
          se cherche, mais une tranche, qui se reconnaît. */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
        <div className="relative">
          <select
            id="team_size"
            name="team_size"
            required
            disabled={disabled}
            value={values.teamSize}
            onChange={(event) => set("teamSize", event.target.value)}
            className={`${selectClass} ${values.teamSize ? "" : "text-ink-500/70"}`}
          >
            <option value="">Effectif</option>
            {TEAM_SIZES.map((option) => (
              <option key={option.value} value={option.value} className="text-ink-900">
                {option.label}
              </option>
            ))}
          </select>
          <Chevron />
        </div>

        <div className="relative">
          <select
            id="aum"
            name="aum"
            required
            disabled={disabled}
            value={values.aum}
            onChange={(event) => set("aum", event.target.value)}
            className={`${selectClass} ${values.aum ? "" : "text-ink-500/70"}`}
          >
            <option value="">Encours conseillé</option>
            {AUM_RANGES.map((option) => (
              <option key={option.value} value={option.value} className="text-ink-900">
                {option.label}
              </option>
            ))}
          </select>
          <Chevron />
        </div>
      </div>

      {/* Le seul champ facultatif, et le seul dont le libellé le dise. Sans
          cette mention il se lit comme les sept autres et fait renoncer celui
          qui n'a pas de profil LinkedIn. */}
      <input
        id="linkedin"
        name="linkedin"
        type="url"
        inputMode="url"
        maxLength={300}
        autoComplete="url"
        placeholder="Profil LinkedIn (optionnel)"
        disabled={disabled}
        value={values.linkedin}
        onChange={(event) => set("linkedin", event.target.value)}
        className={inputClass}
      />
    </>
  );
}

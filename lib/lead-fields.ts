// Les champs communs aux deux portes d'entrée : inscription à la newsletter et
// téléchargement d'un document.
//
// 🛑 UNE SEULE LECTURE POUR LES DEUX ROUTES, ET C'EST TOUT L'INTÉRÊT. Les deux
// routes ont toujours validé les mêmes quatre champs, en deux copies presque
// identiques. Ça tenait à quatre champs ; à huit, la première divergence n'est
// qu'une question de temps — et une divergence ici veut dire deux fiches
// inégales pour la même personne selon la porte qu'elle a poussée, ce que la
// décision du 31/08/2026 vise précisément à faire disparaître.

import {
  COMPANY_MAX_LENGTH,
  PHONE_MAX_LENGTH,
  isAumRange,
  isPhoneLike,
  isTeamSize,
  normalizeLinkedIn,
  splitFullName
} from "@/lib/qualification";
import { JOB_TITLE_MAX_LENGTH, isAcceptableEmail, sanitizeName } from "@/lib/validation";

/**
 * Ce qu'un client peut poster.
 *
 * ⚠️ `full_name` ET `first_name`/`last_name` sont acceptés, et ce n'est pas une
 * hésitation : c'est une FRONTIÈRE RÉSEAU entre applications déployées
 * séparément. Le site vitrine relaie ses inscriptions ici ; le jour où l'un des
 * deux passe au champ unique avant l'autre, refuser l'ancienne forme couperait
 * les inscriptions le temps du décalage. On lit les deux, on écrit une seule
 * chose en base.
 */
export type LeadFieldsPayload = {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  job_title?: string;
  company?: string;
  phone?: string;
  aum?: string;
  team_size?: string;
  linkedin?: string;
};

/** Ce qui part en base, une fois validé. */
export type LeadFields = {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  company: string;
  phone: string;
  aum: string;
  teamSize: string;
  linkedin: string | null;
};

type LeadFieldsResult =
  | { ok: true; fields: LeadFields }
  | { ok: false; message: string };

/**
 * Valide les champs communs.
 *
 * 🛑 CHAQUE MESSAGE NOMME LE CHAMP EN CAUSE. C'est la seule chose que verra
 * quelqu'un dont le formulaire est refusé par le serveur : « Requête invalide »
 * sur huit champs, c'est un abonné perdu qui ne saura jamais pourquoi.
 */
export function readLeadFields(body: LeadFieldsPayload): LeadFieldsResult {
  /* Le nom complet d'abord, les deux champs séparés en repli. La base garde
     `first_name` (le script d'envoi personnalise chaque message avec) : c'est
     le formulaire qui a changé, pas la table. */
  const fullName = sanitizeName(body.full_name);
  const split = fullName ? splitFullName(fullName) : null;
  const firstName = split ? split.firstName : sanitizeName(body.first_name);
  const lastName = split ? split.lastName : sanitizeName(body.last_name);

  if (!firstName) {
    return { ok: false, message: "Nom et prénom invalides." };
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  if (!isAcceptableEmail(email)) {
    return { ok: false, message: "Email invalide." };
  }

  const jobTitle = sanitizeName(body.job_title, JOB_TITLE_MAX_LENGTH);
  if (!jobTitle) {
    return { ok: false, message: "Métier invalide." };
  }

  const company = sanitizeName(body.company, COMPANY_MAX_LENGTH);
  if (!company) {
    return { ok: false, message: "Nom de la société invalide." };
  }

  const phone = String(body.phone ?? "").trim().slice(0, PHONE_MAX_LENGTH);
  if (!isPhoneLike(phone)) {
    return { ok: false, message: "Numéro de téléphone invalide." };
  }

  /* Les deux tranches doivent venir de la liste : ce sont des menus déroulants,
     donc une valeur hors liste ne peut venir que d'un POST direct ou d'un
     formulaire resté ouvert sur une ancienne version. L'écarter en silence
     reviendrait à accepter un champ vide sur un champ obligatoire. */
  const teamSize = String(body.team_size ?? "").trim();
  if (!isTeamSize(teamSize)) {
    return { ok: false, message: "Effectif invalide." };
  }

  const aum = String(body.aum ?? "").trim();
  if (!isAumRange(aum)) {
    return { ok: false, message: "Encours invalide." };
  }

  /* Le seul champ facultatif, et le seul écarté en silence : un profil mal
     collé ne doit jamais coûter l'inscription. */
  const linkedin = normalizeLinkedIn(String(body.linkedin ?? ""));

  return {
    ok: true,
    fields: { firstName, lastName, email, jobTitle, company, phone, aum, teamSize, linkedin }
  };
}

/** Les colonnes à écrire dans `leads`, telles quelles. */
export function leadColumns(fields: LeadFields) {
  return {
    first_name: fields.firstName,
    last_name: fields.lastName,
    email: fields.email,
    job_title: fields.jobTitle,
    company: fields.company,
    phone: fields.phone,
    aum: fields.aum,
    team_size: fields.teamSize,
    linkedin: fields.linkedin
  };
}

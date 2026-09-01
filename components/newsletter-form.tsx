"use client";

import { useState } from "react";
import {
  EMPTY_LEAD_FIELDS,
  LeadFields,
  leadFieldsBody,
  validateLeadFields,
  type LeadFieldValues
} from "@/components/lead-fields";
import { branding } from "@/lib/config/branding";

type NewsletterResponse = {
  ok: boolean;
  alreadySubscribed?: boolean;
  message?: string;
};

type NewsletterFormProps = {
  source?: string;
  compact?: boolean;
};

/**
 * Inscription à la newsletter Intelligence Patrimoine.
 *
 * Les champs eux-mêmes vivent dans `components/lead-fields.tsx`, partagés avec
 * le formulaire de téléchargement : les deux doivent recueillir exactement la
 * même chose, sinon la fiche d'une personne dépend de la porte qu'elle a
 * poussée. Ce fichier ne garde que ce qui lui est propre — la route appelée et
 * ce qu'on répond une fois l'inscription prise.
 */
export function NewsletterForm({ source, compact = false }: NewsletterFormProps) {
  const [values, setValues] = useState<LeadFieldValues>(EMPTY_LEAD_FIELDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    const probleme = validateLeadFields(values);
    if (probleme) {
      setErrorMessage(probleme);
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...leadFieldsBody(values), source })
      });

      const payload: NewsletterResponse = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || "Impossible d'enregistrer votre inscription.");
      }

      setSuccessMessage(
        payload.alreadySubscribed
          ? "Vous êtes déjà inscrit à la newsletter Charlie."
          : "Inscription validée. Bienvenue dans la newsletter Charlie."
      );
      setValues(EMPTY_LEAD_FIELDS);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur inattendue.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const formSpacingClasses = compact
    ? "mt-3 space-y-2.5 sm:space-y-3"
    : "mt-[clamp(1rem,4vw,1.5rem)] space-y-3.5 sm:mt-6 sm:space-y-4";
  const fieldHeightClass = compact ? "min-h-11 sm:min-h-10" : "min-h-12";
  const fieldPaddingClass = compact ? "py-2.5" : "py-3";
  const fieldTextClass = compact ? "text-[16px] leading-6 sm:text-sm sm:leading-5" : "text-[16px] leading-6";
  const selectRightPaddingClass = compact ? "pr-10" : "pr-11";
  const submitTextClass = compact ? "text-[16px] sm:text-sm" : "text-[16px]";

  return (
    <form className={formSpacingClasses} onSubmit={handleSubmit} noValidate>
      <LeadFields
        values={values}
        onChange={setValues}
        disabled={isSubmitting}
        styles={{
          fieldHeightClass,
          fieldPaddingClass,
          fieldTextClass,
          selectRightPaddingClass,
          compact
        }}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className={`${fieldHeightClass} w-full rounded-lg bg-ink-900 px-4 ${fieldPaddingClass} ${submitTextClass} font-medium tracking-wide leading-6 text-ink-50 transition hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-70 sm:leading-5`}
      >
        {isSubmitting ? "Chargement..." : "S'inscrire à la newsletter"}
      </button>

      {errorMessage ? <p className="text-sm leading-relaxed text-red-600">{errorMessage}</p> : null}

      {/* 🛑 LA PROPOSITION DE RENDEZ-VOUS N'ARRIVE QU'APRÈS L'INSCRIPTION, ET
          C'EST TOUT L'INTÉRÊT. Deux sorties offertes en même temps, c'est la
          première qu'on perd : le screener l'a payé le 10/08/2026 en posant un
          bouton de réservation dans la fenêtre qui demandait les coordonnées
          (cf. `CharlieOfferDialog`, où il a été retiré). Ici le formulaire est
          déjà envoyé quand le lien apparaît — il ne concurrence plus rien, et
          il tombe au moment où la personne vient de lever la main.

          Il s'affiche aussi sur « déjà inscrit », qui est le cas le plus
          parlant : quelqu'un qui revient s'inscrire une seconde fois n'a rien
          à gagner du message seul. */}
      {successMessage ? (
        <div className="space-y-1.5">
          <p className="text-sm leading-relaxed text-emerald-700">{successMessage}</p>
          <p className="text-sm leading-relaxed text-ink-700">
            Une question sur vos outils, ou sur ce que Charlie ferait chez vous ?{" "}
            <a
              href={branding.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-accent-500 underline underline-offset-2 transition hover:text-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/30"
            >
              Prenez trente minutes
            </a>
            .
          </p>
        </div>
      ) : null}

      <p className="text-[10px] uppercase tracking-[0.14em] text-ink-500">Un email utile, sans spam.</p>
    </form>
  );
}

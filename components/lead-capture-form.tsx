"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  EMPTY_LEAD_FIELDS,
  LeadFields,
  leadFieldsBody,
  validateLeadFields,
  type LeadFieldValues
} from "@/components/lead-fields";

type LeadCaptureFormProps = {
  slug: string;
  compact?: boolean;
};

type CaptureResponse = {
  ok: boolean;
  message?: string;
  redirectUrl?: string;
};

/**
 * Accès à un document, contre les coordonnées.
 *
 * Les champs vivent dans `components/lead-fields.tsx`, partagés avec
 * l'inscription à la newsletter : les deux portes doivent recueillir exactement
 * la même chose. Ce fichier ne garde que ce qui lui est propre — le document
 * demandé, et la redirection qui suit l'envoi.
 */
export function LeadCaptureForm({ slug, compact = false }: LeadCaptureFormProps) {
  const searchParams = useSearchParams();
  const [values, setValues] = useState<LeadFieldValues>(EMPTY_LEAD_FIELDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const source = searchParams.get("src") ?? undefined;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    const probleme = validateLeadFields(values);
    if (probleme) {
      setErrorMessage(probleme);
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...leadFieldsBody(values), slug, source })
      });

      const payload: CaptureResponse = await response.json();

      if (!response.ok || !payload.ok || !payload.redirectUrl) {
        throw new Error(payload.message || "Impossible d'enregistrer vos informations.");
      }

      window.location.href = payload.redirectUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur inattendue.";
      setErrorMessage(message);
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
        {isSubmitting ? "Chargement..." : "Accéder au document"}
      </button>

      {errorMessage ? <p className="text-sm leading-relaxed text-red-600">{errorMessage}</p> : null}

      <p className="text-[10px] uppercase tracking-[0.14em] text-ink-500">Accès immédiat après validation</p>
    </form>
  );
}

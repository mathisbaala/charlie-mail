import Image from "next/image";
import { branding } from "@/lib/config/branding";

/**
 * Bannière de marque, recomposée en HTML/CSS (11/09/2026).
 *
 * L'ancien bitmap `charlie-banniere-polyvalente.png` datait de la palette
 * crème/terracotta : impossible à raccorder au système blanc/encre/vert sans
 * regénérer une image. Le message est donc rendu en vrai texte — même contenu
 * (« La donnée patrimoniale existe déjà, Charlie la rend exploitable »), serif
 * roman (jamais italique, cf. DESIGN.md), accent vert unique sur le mot qui
 * porte le gain. La rampe Collecte → Exploitation reprend les quatre étapes du
 * schéma de l'ancienne bannière, en micro-labels illustratifs.
 */
const PIPELINE_STAGES = ["Collecte", "Normalisation", "Circulation", "Exploitation"] as const;

export function CharlieBanner() {
  return (
    <div className="overflow-hidden rounded-xl border border-ink-200/60 bg-white sm:rounded-2xl">
      {/* Tablette / desktop : composition horizontale. */}
      <div className="hidden flex-col gap-5 px-7 py-6 sm:flex lg:px-9">
        <div className="flex items-center justify-between gap-8">
          <div className="flex shrink-0 flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
              <Image
                src={branding.companyLogoUrl}
                alt={`Logo ${branding.companyName}`}
                width={40}
                height={40}
                className="h-8 w-8"
              />
              <span className="text-[1.45rem] font-bold leading-none tracking-tight text-ink-900">
                {branding.companyName}
              </span>
            </div>
            <p className="text-[0.625rem] uppercase tracking-[0.18em] text-ink-500">
              Infrastructure de données patrimoniales
            </p>
          </div>
          <p
            className="max-w-[26rem] text-right text-[clamp(1.15rem,2.2vw,1.45rem)] leading-snug text-ink-900"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            La donnée patrimoniale existe déjà, Charlie la rend{" "}
            <span className="text-accent-500">exploitable</span>.
          </p>
        </div>

        {/* Rampe illustrative : le trajet de la donnée, de la collecte au
            livrable. Décoratif — le message au-dessus dit déjà l'essentiel. */}
        <div aria-hidden="true" className="flex items-center border-t border-ink-200/60 pt-4">
          {PIPELINE_STAGES.map((stage, index) => (
            <span key={stage} className="flex items-center">
              {index > 0 ? (
                <svg viewBox="0 0 24 8" className="mx-4 h-2 w-6 text-ink-200 lg:mx-6" fill="none">
                  <path d="M0 4H22M22 4L19 1M22 4L19 7" stroke="currentColor" strokeWidth="1.25" />
                </svg>
              ) : null}
              <span
                className={`text-[0.625rem] uppercase tracking-[0.18em] ${
                  index === PIPELINE_STAGES.length - 1 ? "font-semibold text-accent-500" : "text-ink-500"
                }`}
              >
                {stage}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Mobile : repli compact — la composition horizontale n'a pas la place
          de respirer sous ~sm, on garde le même message empilé. */}
      <div className="flex flex-col gap-2.5 bg-ink-50 px-5 py-5 sm:hidden">
        <div className="flex items-center gap-2.5">
          <Image
            src={branding.companyLogoUrl}
            alt={`Logo ${branding.companyName}`}
            width={32}
            height={32}
            className="h-7 w-7"
          />
          <span className="text-[1.3rem] font-bold leading-none tracking-tight text-ink-900">
            {branding.companyName}
          </span>
        </div>
        <p className="text-[0.625rem] uppercase tracking-[0.18em] text-ink-500">
          Infrastructure de données patrimoniales
        </p>
        <p className="text-[1.05rem] leading-snug text-ink-900" style={{ fontFamily: "var(--font-serif)" }}>
          La donnée patrimoniale existe déjà, Charlie la rend{" "}
          <span className="text-accent-500">exploitable</span>.
        </p>
      </div>
    </div>
  );
}

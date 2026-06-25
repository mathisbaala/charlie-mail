import Image from "next/image";
import { branding } from "@/lib/config/branding";

export function CharlieBanner() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-ink-200/60 sm:rounded-2xl">
      {/* Tablette / desktop : bannière de marque complète. */}
      <Image
        src="/charlie-banniere-polyvalente.png"
        alt={`${branding.companyName} — Infrastructure de données patrimoniales. La donnée patrimoniale existe déjà, Charlie la rend exploitable.`}
        width={3200}
        height={800}
        priority
        sizes="(max-width: 1024px) 100vw, 56rem"
        className="hidden h-auto w-full sm:block"
      />

      {/* Mobile : repli compact lisible — l'image dense 4:1 devient illisible
          sous ~sm, on reprend donc le même message en texte. */}
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
          <em style={{ fontStyle: "italic", color: "oklch(0.5 0.13 38)" }}>exploitable</em>.
        </p>
      </div>
    </div>
  );
}

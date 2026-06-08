import Image from "next/image";
import { branding } from "@/lib/config/branding";

export function CharlieBanner() {
  return (
    <div
      className="relative overflow-hidden rounded-xl sm:rounded-2xl"
      style={{
        background: "linear-gradient(160deg, #FCFAF4 0%, #F4EFE4 55%, #E2DACB 100%)"
      }}
    >
      <div className="flex flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:gap-7 sm:px-8 sm:py-7 lg:min-h-[9.5rem] lg:px-10 lg:py-9">
        {/* Logo */}
        <div className="flex shrink-0 items-center gap-2.5">
          <Image
            src={branding.companyLogoUrl}
            alt={`Logo ${branding.companyName}`}
            width={40}
            height={40}
            className="h-8 w-8 sm:h-10 sm:w-10"
          />
          <span className="text-[1.35rem] font-bold leading-none tracking-tight text-ink-900 sm:text-[1.5rem]">
            {branding.companyName}
          </span>
        </div>

        {/* Séparateur vertical (sm+) */}
        <div className="hidden h-12 w-px shrink-0 bg-ink-900/25 sm:block" aria-hidden="true" />

        {/* Accroche */}
        <p
          className="text-[clamp(1.1rem,3vw,1.45rem)] leading-[1.32] text-ink-900"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          On{" "}
          <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}>trouve</span>{" "}
          vos clients et on{" "}
          <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}>transforme</span>{" "}
          votre cabinet en 3{" "}
          <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}>mois</span>{" "}
          grâce à{" "}
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              textDecoration: "underline",
              textDecorationColor: "#9A4222",
              textDecorationThickness: "2px",
              textUnderlineOffset: "4px"
            }}
          >
            l'IA
          </span>
        </p>
      </div>
    </div>
  );
}

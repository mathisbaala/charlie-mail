import Image from "next/image";
import { branding } from "@/lib/config/branding";

export function CharlieBanner() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-ink-200/60 sm:rounded-2xl">
      <Image
        src="/charlie-banniere-polyvalente.png"
        alt={`${branding.companyName} — Infrastructure de données patrimoniales. La donnée patrimoniale existe déjà, Charlie la rend exploitable.`}
        width={3200}
        height={800}
        priority
        sizes="(max-width: 1024px) 100vw, 56rem"
        className="h-auto w-full"
      />
    </div>
  );
}

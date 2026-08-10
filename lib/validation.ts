// Validation des formulaires de capture.
//
// Le 4 août 2026, un audit automatisé a inscrit en 30 secondes : 12 adresses
// @example.com, une valeur de 10 000 caractères dans le champ prénom, et
// « <script>alert(1)</script> » comme prénom. Tout est passé, et les lignes
// sont restées dans la liste d'envoi. Le 10 août, elles ont fait échouer deux
// fois l'envoi de la newsletter aux 2 400 abonnés : Resend refuse les domaines
// réservés, et le prénom sert à préfixer le sujet, dont la limite est de 2 000
// caractères.
//
// Ce module borne ce qui entre. Il reste volontairement permissif sur le fond :
// on protège la mécanique d'envoi, on ne juge pas qui a le droit de s'inscrire.

/** Domaines réservés par la RFC 2606 et RFC 6761 : aucun ne peut recevoir un mail. */
const RESERVED_DOMAINS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "example.edu",
  "test.com",
  "test",
  "invalid",
  "localhost",
  "local"
]);

export const NAME_MAX_LENGTH = 80;
export const JOB_TITLE_MAX_LENGTH = 120;

/**
 * Nettoie un champ texte saisi par l'utilisateur : caractères de contrôle
 * remplacés par une espace, espaces multiples réduits, longueur bornée.
 * Renvoie une chaîne vide si la valeur ne ressemble pas à un nom (balise, URL).
 */
export function sanitizeName(value: unknown, maxLength = NAME_MAX_LENGTH): string {
  const raw = String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!raw) return "";
  if (/[<>{}]|https?:\/\//i.test(raw)) return "";

  return raw.length > maxLength ? raw.slice(0, maxLength).trim() : raw;
}

/**
 * Validation d'adresse plus stricte que `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`, qui
 * laissait passer les domaines réservés et les libellés malformés.
 */
export function isAcceptableEmail(value: unknown): boolean {
  const email = String(value ?? "").trim().toLowerCase();

  if (!email || email.length > 254) return false;
  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(email)) return false;

  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return false;
  if (localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..")) return false;
  if (domain.includes("..")) return false;

  const labels = domain.split(".");
  if (labels.some((label) => !label || label.startsWith("-") || label.endsWith("-"))) return false;
  if (labels[labels.length - 1].length < 2) return false;

  // Domaine réservé, exact (« example.com ») ou en suffixe (« sub.example.com »).
  for (const reserved of RESERVED_DOMAINS) {
    if (domain === reserved || domain.endsWith(`.${reserved}`)) return false;
  }

  return true;
}

/**
 * Limite de fréquence par IP.
 *
 * Best-effort assumé : en serverless la mémoire n'est pas partagée entre
 * instances, donc un attaquant réparti sur plusieurs instances passe entre les
 * mailles. Cela suffit contre le cas réel observé — une rafale rapide qui frappe
 * la même instance — sans imposer de dépendance externe. Pour une garantie
 * stricte il faudrait un compteur partagé (table Supabase ou Redis).
 */
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;
const recentRequests = new Map<string, number[]>();

export function checkRateLimit(key: string, now = Date.now()): boolean {
  if (!key) return true;

  const previous = recentRequests.get(key) ?? [];
  const withinWindow = previous.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

  if (withinWindow.length >= RATE_LIMIT_MAX_REQUESTS) {
    recentRequests.set(key, withinWindow);
    return false;
  }

  withinWindow.push(now);
  recentRequests.set(key, withinWindow);

  // Purge opportuniste : sans elle la Map grossit indéfiniment sur une instance
  // longue durée.
  if (recentRequests.size > 5000) {
    for (const [mapKey, timestamps] of recentRequests) {
      if (timestamps.every((timestamp) => now - timestamp >= RATE_LIMIT_WINDOW_MS)) {
        recentRequests.delete(mapKey);
      }
    }
  }

  return true;
}

/** IP de l'appelant, telle que transmise par le proxy Vercel. */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() ?? "";
}

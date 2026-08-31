create extension if not exists pgcrypto;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  redirect_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  first_name text,
  last_name text,
  email text not null,
  job_title text,
  document_slug text not null,
  redirect_url text not null,
  source text,
  created_at timestamptz not null default now()
);

alter table public.leads
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists job_title text;

-- Les cinq champs du 31/08/2026 : les mêmes coordonnées partout où Charlie en
-- recueille (ce site, la landing, le screener). Voir
-- `supabase/migrations/20260831_les_memes_champs_partout.sql` pour la décision.
-- Aucune n'est `not null` : les 2 400 abonnés déjà en base n'ont rien de tout
-- ça, et c'est le code qui exige ces champs à l'entrée.
alter table public.leads
  add column if not exists company text,
  add column if not exists phone text,
  add column if not exists aum text,
  add column if not exists team_size text,
  add column if not exists linkedin text;

-- Colonnes consommées par l'autre projet, charlie-newsletter, qui lit cette même
-- table pour constituer sa liste d'envoi. Elles ont longtemps été créées à la
-- main côté newsletter et n'apparaissaient pas ici : rejouer ce schéma sur un
-- nouvel environnement produisait une table où plus aucun envoi n'était possible.
-- Elles font partie du contrat de la table, pas d'un détail d'implémentation.
--
--   newsletter_opt_in   consentement. L'envoi retient les lignes qui ne valent
--                       pas false, d'où le défaut à true : une capture via le
--                       formulaire vaut inscription.
--   unsubscribed_at     date de sortie de liste. Non nul = jamais destinataire.
--   suppression_reason  origine de la sortie. null = désabonnement volontaire ;
--                       bounce_purge = adresse morte ; audit_artifact = fausse
--                       adresse laissée par un test ; invalid_email = adresse
--                       malformée. Sans cette colonne, les purges se confondent
--                       avec les vrais départs et faussent le taux de
--                       désabonnement.
alter table public.leads
  add column if not exists newsletter_opt_in boolean not null default true,
  add column if not exists unsubscribed_at timestamptz,
  add column if not exists suppression_reason text;

comment on column public.leads.suppression_reason is
  'Origine de la suppression : null = désabonnement volontaire, bounce_purge = adresse morte purgée, audit_artifact = fausse adresse laissée par un test automatisé, invalid_email = adresse malformée.';

create index if not exists idx_documents_slug
  on public.documents (slug);

create index if not exists idx_leads_document_slug_created_at
  on public.leads (document_slug, created_at desc);

create index if not exists idx_leads_email_lower
  on public.leads ((lower(email)));

alter table public.documents enable row level security;
alter table public.leads enable row level security;

-- Server-side writes/reads use SUPABASE_SERVICE_ROLE_KEY from Next.js API/server.
-- No anon policies needed for this implementation.

-- Les documents (slug -> page de redirection) sont gérés directement en base.
-- Chaque redirect_url doit pointer vers une page de la rubrique ressources du site,
-- par ex. 'https://www.charliefinance.fr/ressources/mon-guide'.
-- Exemple:
-- insert into public.documents (slug, name, redirect_url)
-- values ('mon-guide', 'Mon guide', 'https://www.charliefinance.fr/ressources/mon-guide')
-- on conflict (slug) do nothing;

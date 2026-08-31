-- Les mêmes champs partout — 31/08/2026
-- ═══════════════════════════════════════════════════════════════════════════
-- 🛑 À EXÉCUTER **AVANT** DE DÉPLOYER LE CODE QUI L'ACCOMPAGNE. Les routes
-- `/api/newsletter` et `/api/capture` écrivent désormais ces cinq colonnes à
-- chaque inscription : sans elles, l'insert échoue et plus personne ne peut
-- s'inscrire ni télécharger un document. Dans l'autre sens il n'y a aucun
-- risque — des colonnes en attente ne gênent rien.
--
-- ── Ce que ça sert ──────────────────────────────────────────────────────────
-- Décision de Mathis, le 31/08/2026 : partout où Charlie recueille des
-- coordonnées, on demande les mêmes champs et on exige les mêmes. Trois
-- applications, six formulaires — ce site (newsletter et documents), la landing
-- (`/contact`, la fenêtre de capture, les pages d'apporteur) et le screener.
--
-- Cette application n'en demandait que quatre : prénom, nom, email, métier. Une
-- même personne inscrite ici puis passée par /contact produisait deux fiches
-- inégales, et c'est cette disparité qui obligeait à rappeler pour compléter.
--
-- `first_name` et `last_name` NE BOUGENT PAS. Le formulaire ne demande plus
-- qu'un champ « Nom et prénom » — comme les deux autres applications — mais le
-- serveur le découpe avant d'écrire (`splitFullName`), parce que le script
-- d'envoi personnalise chaque message avec le prénom. Fondre les deux colonnes
-- aurait demandé de reprendre la newsletter entière pour gagner une case.
--
-- ⚠️ AUCUNE COLONNE N'EST `not null`, ET C'EST VOLONTAIRE. Les 2 400 abonnés
-- déjà en base n'ont rien de tout ça : une contrainte rétroactive refuserait la
-- migration elle-même. C'est le CODE qui exige ces champs à l'entrée, sur les
-- lignes nouvelles — la base, elle, doit continuer de porter l'historique.
--
-- Les libellés de `aum` et `team_size` sont ceux de la landing, mot pour mot
-- (voir `lib/qualification.ts`) : les trois applications alimentent la même
-- colonne du CRM, qui se filtre.

alter table public.leads
  add column if not exists company text,
  add column if not exists phone text,
  add column if not exists aum text,
  add column if not exists team_size text,
  add column if not exists linkedin text;

comment on column public.leads.company is
  'Société ou cabinet, tel que déclaré. Obligatoire à la saisie depuis le 31/08/2026.';
comment on column public.leads.phone is
  'Téléphone. Obligatoire à la saisie depuis le 31/08/2026 ; format libre, six chiffres minimum.';
comment on column public.leads.aum is
  'Encours conseillé, en tranche. Vocabulaire commun aux trois applications (lib/qualification.ts).';
comment on column public.leads.team_size is
  'Effectif de la structure, en tranche. Même vocabulaire, même colonne du CRM.';
comment on column public.leads.linkedin is
  'Profil LinkedIn. SEUL champ facultatif du formulaire : tous les professionnels n''en ont pas.';

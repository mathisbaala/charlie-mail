# charlie-mail

Capture email dynamique pour Charlie.

> **La table `public.leads` est partagée avec un autre projet.** Elle est écrite
> ici (capture) et lue par `charlie-newsletter` (envoi de la newsletter). Toucher
> à `email`, `first_name`, `newsletter_opt_in`, `unsubscribed_at` ou
> `suppression_reason` affecte les deux. Ces colonnes sont décrites dans
> `supabase/schema.sql` : elles ont longtemps été créées à la main côté
> newsletter, si bien que rejouer le schéma produisait une table où plus aucun
> envoi n'était possible.
>
> Une ligne par téléchargement, volontairement : une même adresse apparaît autant
> de fois qu'elle a demandé de documents. Ce ne sont pas des doublons à purger,
> c'est l'historique de ce qui intéresse chaque prospect. L'envoi déduplique de
> son côté.
>
> Les limites de saisie de `lib/validation.ts` (80 caractères pour un nom) sont
> plus larges que celles de l'envoi (40, le prénom préfixant un sujet limité à
> 2 000 caractères par Resend). Un prénom trop long est tronqué à l'envoi, jamais
> rejeté : l'écart est voulu.

Landing pages disponibles:
- dynamique via `/<slug>` (document + redirection)
- statique via `/newsletter` (inscription newsletter)

Flow:
1. L'utilisateur ouvre `/<slug>`
2. La page charge le document depuis Supabase (`documents`)
3. L'utilisateur renseigne les huit champs (voir « Ce qu'on demande » plus bas)
4. L'API enregistre le lead dans Supabase (`leads`)
5. Redirection immédiate vers `redirect_url`

Flow newsletter:
1. L'utilisateur ouvre `/newsletter`
2. Il renseigne les huit mêmes champs qu'au téléchargement d'un document
3. L'API enregistre dans Supabase (`leads`) avec `document_slug = newsletter`
4. Message de confirmation sur la page

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase (database only)

## Structure

```txt
.
├── app
│   ├── [slug]/page.tsx
│   ├── api/capture/route.ts
│   ├── api/newsletter/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   ├── newsletter/page.tsx
│   └── page.tsx
├── components
│   ├── lead-capture-form.tsx
│   └── newsletter-form.tsx
├── lib
│   ├── config/branding.ts
│   ├── documents.ts
│   └── supabase/admin.ts
├── supabase
│   └── schema.sql
├── .env.example
└── README.md
```

## Route dynamique

- `/facebook`
- `/instagram`
- `/papers`

Template unique: [`app/[slug]/page.tsx`](app/[slug]/page.tsx)

## Route newsletter

- `/newsletter`

Template: [`app/newsletter/page.tsx`](app/newsletter/page.tsx)

## Schéma Supabase

Exécuter [`supabase/schema.sql`](supabase/schema.sql) dans Supabase SQL Editor.

Tables:

- `documents`
  - `id` uuid pk
  - `slug` text unique
  - `name` text
  - `redirect_url` text
  - `created_at` timestamptz

- `leads`
  - `id` uuid pk
  - `first_name` text
  - `last_name` text
  - `email` text
  - `job_title` text
  - `document_slug` text
  - `redirect_url` text
  - `source` text (optionnel)
  - `created_at` timestamptz

## Variables d'environnement

Copier `.env.example` vers `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_OWNER_NAME`
- `NEXT_PUBLIC_OWNER_PHOTO_URL`
- `NEXT_PUBLIC_BRAND_NAME`
- `NEXT_PUBLIC_BRAND_LOGO_URL`
- `NEXT_PUBLIC_SITE_URL`

## API route

`POST /api/capture`

Body:

```json
{
  "first_name": "Jean",
  "last_name": "Dupont",
  "email": "jean@exemple.com",
  "job_title": "Conseiller en gestion de patrimoine",
  "slug": "facebook",
  "source": "linkedin"
}
```

Comportement:
- valide prénom + nom + email + métier + slug
- vérifie que le slug existe dans `documents`
- valide `redirect_url` du document côté serveur (HTTP/HTTPS)
- insère dans `leads`
- retourne l'URL de redirection en succès

`POST /api/newsletter`

Body:

```json
{
  "email": "jean@exemple.com",
  "source": "linkedin"
}
```

Comportement:
- valide l'email
- vérifie si l'email est déjà inscrit sur `document_slug = newsletter`
- insère dans `leads` si absent
- retourne un statut succès (inscrit / déjà inscrit)

## Ajouter un nouveau document (sans code)

Ajouter uniquement une ligne dans Supabase:

```sql
insert into public.documents (slug, name, redirect_url)
values ('guide', 'Guide', 'https://www.charliefinance.fr/ressources/votre-guide');
```

Le `redirect_url` pointe vers une page de la rubrique ressources du site (plus vers Notion).

La landing fonctionne ensuite directement sur:

- `https://votre-domaine.com/guide`

## Run

```bash
npm install
npm run dev
```


## Ce qu'on demande, et pourquoi c'est la même chose partout

Décision de Mathis, le 31/08/2026 : **partout où Charlie recueille des
coordonnées, on demande les mêmes champs et on exige les mêmes.** Cela couvre
trois applications et six formulaires — cette application (newsletter et
documents), la landing (`/contact`, sa fenêtre de capture, les pages
d'apporteur) et le screener.

**Sept champs obligatoires** : nom et prénom, email, société, téléphone,
effectif, encours — plus le **métier**, propre à cette application et au
screener, qui sert à segmenter les envois. Le **profil LinkedIn** est le seul
facultatif.

Ce que ça a réglé : une même personne inscrite ici puis passée par `/contact`
produisait deux fiches inégales dans le CRM, et c'est cette disparité qui
obligeait à rappeler pour compléter.

### Trois choses à ne pas défaire

- **Le nom tient en UN champ, mais la base en garde deux.** `first_name` sert à
  personnaliser chaque envoi, et le script de la newsletter le lit chaque lundi.
  C'est `splitFullName` (`lib/qualification.ts`) qui découpe à la réception.
  Fondre les deux colonnes demanderait de reprendre la newsletter entière.

- **Les routes acceptent `full_name` ET `first_name`/`last_name`.** Ce n'est pas
  une hésitation : la landing nous relaie ses inscriptions, et les deux
  applications se déploient séparément. Refuser l'ancienne forme couperait les
  inscriptions le temps d'un décalage.

- 🛑 **Les tranches d'encours et d'effectif sont recopiées à la main dans les
  trois dépôts** (`lib/qualification.ts` ici, `app/src/lib/lead.ts` côté
  screener, `lib/waitlist/survey-questions.ts` côté landing — c'est la source).
  Les trois alimentent la même colonne du CRM, qui se filtre, et aucun test ne
  peut le garantir puisque les dépôts ne partagent pas de code. **Toute retouche
  d'un libellé se fait des trois côtés, le même jour.**

### Les champs eux-mêmes ne s'écrivent qu'une fois

`components/lead-fields.tsx` (l'affichage) et `lib/lead-fields.ts` (la lecture et
la validation) sont partagés par les deux formulaires et les deux routes. Ils
étaient deux copies, ce qui tenait à quatre champs ; à huit, la première
divergence n'était qu'une question de temps — et une divergence ici veut dire que
la fiche d'une personne dépend de la porte qu'elle a poussée.

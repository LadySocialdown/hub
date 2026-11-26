-- ============================================================
-- STUDIO DE CRÉATION
-- Réglages et charte de l'élève, publications (carrousels, stories, Reels),
-- mouvements de crédits. Même modèle de sécurité que 009_resource_attempts.
-- ============================================================

-- ------------------------------------------------------------
-- Réglages et charte (une ligne par élève)
-- ------------------------------------------------------------
create table public.studio_settings (
  user_id             text primary key references public.users(id) on delete cascade,
  activity            text not null default '',
  audience            text not null default '',
  handle              text not null default '',
  tone                text not null default '',
  logo_url            text,
  show_logo_on_cover  boolean not null default true,
  colors              jsonb not null default '{"principale":"#2F4A3A","accent":"#E9B8B0","fond":"#FBF7F0","detail":"#8E4E45"}',
  font_title          text not null default 'Cormorant Garamond',
  font_body           text not null default 'DM Sans',
  custom_fonts        jsonb not null default '[]',
  default_style       text not null default 'doux' check (default_style in ('doux', 'edito', 'magazine', 'minimal', 'ref')),
  reference_style     jsonb,
  pillars             jsonb not null default '[]',
  networks            text[] not null default '{Instagram}',
  posts_per_week      int not null default 5 check (posts_per_week between 1 and 14),
  preferred_time      text not null default '18:00',
  updated_at          timestamptz not null default now(),
  created_at          timestamptz not null default now()
);

alter table public.studio_settings enable row level security;

create policy "studio_settings_select_own" on public.studio_settings
  for select using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
create policy "studio_settings_insert_own" on public.studio_settings
  for insert with check (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
create policy "studio_settings_update_own" on public.studio_settings
  for update using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- ------------------------------------------------------------
-- Publications du planning
-- ------------------------------------------------------------
create table public.studio_publications (
  id                 uuid primary key default gen_random_uuid(),
  user_id            text not null references public.users(id) on delete cascade,
  scheduled_date     date not null,
  scheduled_time     text not null default '18:00',
  format             text not null check (format in ('carrousel', 'story', 'reel')),
  platforms          text[] not null default '{Instagram}',
  pillar             text not null default '',
  objective          text not null default 'Faire découvrir',
  planned_objective  text not null default 'Faire découvrir',
  kpi                text not null default '',
  title              text not null default '',
  hook               text not null default '',
  cta                text not null default '',
  visual_idea        text not null default '',
  caption            text not null default '',
  hashtags           text not null default '',
  alt_text           text not null default '',
  style              text not null default 'doux',
  content            jsonb not null default '{}',
  status             text not null default 'a_creer' check (status in ('a_creer', 'a_relire', 'cree', 'programme', 'publie')),
  source             text not null default 'spontane' check (source in ('spontane', 'cahier', 'declinaison')),
  derived_from       uuid references public.studio_publications(id) on delete set null,
  rewrites_used      int not null default 0,
  export_urls        jsonb not null default '[]',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index idx_studio_publications_user_date on public.studio_publications(user_id, scheduled_date);

alter table public.studio_publications enable row level security;

create policy "studio_publications_select_own" on public.studio_publications
  for select using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
create policy "studio_publications_insert_own" on public.studio_publications
  for insert with check (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
create policy "studio_publications_update_own" on public.studio_publications
  for update using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- ------------------------------------------------------------
-- Mouvements de crédits (le solde = somme des deltas valides)
-- ------------------------------------------------------------
create table public.studio_credit_ledger (
  id              uuid primary key default gen_random_uuid(),
  user_id         text not null references public.users(id) on delete cascade,
  delta           int not null,
  bucket          text not null check (bucket in ('mensuel', 'pack')),
  reason          text not null default '',
  publication_id  uuid references public.studio_publications(id) on delete set null,
  period          text,          -- 'YYYY-MM' pour les crédits mensuels
  lot_id          uuid references public.studio_credit_ledger(id) on delete set null, -- pack consommé
  expires_at      timestamptz,   -- fin de mois (mensuel) ou +6 mois (pack)
  created_at      timestamptz not null default now()
);

create index idx_studio_credit_ledger_user on public.studio_credit_ledger(user_id, created_at);
-- Un seul versement mensuel par élève et par mois.
create unique index uniq_studio_monthly_grant
  on public.studio_credit_ledger(user_id, period)
  where bucket = 'mensuel' and delta > 0;

alter table public.studio_credit_ledger enable row level security;

create policy "studio_credit_ledger_select_own" on public.studio_credit_ledger
  for select using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- ------------------------------------------------------------
-- Stockage : logos, polices, photos, images exportées
-- Un dossier par élève : studio/<user_id>/...
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('studio', 'studio', true)
on conflict (id) do nothing;

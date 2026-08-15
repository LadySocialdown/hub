-- ============================================================
-- PRÉCOMMANDES (payantes) — La Petite Académie
-- ============================================================
create table public.precommandes_academie (
  id                 uuid primary key default gen_random_uuid(),
  prenom             text not null,
  email              text not null,
  montant            integer not null, -- montant payé, en euros
  stripe_session_id  text not null unique,
  paid_at            timestamptz not null default now(),
  statut             text not null default 'paye' check (statut in ('paye'))
);

-- Admin-only via service_role (no anon/user access) — même pattern que preinscriptions_academie.
alter table public.precommandes_academie enable row level security;

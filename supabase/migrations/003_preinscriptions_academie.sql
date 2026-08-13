-- ============================================================
-- PRÉINSCRIPTIONS — La Petite Académie
-- ============================================================
create table public.preinscriptions_academie (
  id     uuid primary key default gen_random_uuid(),
  prenom text not null,
  email  text not null unique,
  date   timestamptz not null default now(),
  statut text not null default 'en_attente' check (statut in ('en_attente', 'contactee', 'convertie'))
);

-- Admin-only via service_role (no anon/user access) — même pattern que cpf_students.
alter table public.preinscriptions_academie enable row level security;

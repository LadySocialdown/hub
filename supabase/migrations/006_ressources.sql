-- ============================================================
-- RESSOURCES — gratuites (compte requis) et payantes (ebooks, outils)
-- ============================================================

alter table public.resources drop constraint resources_type_check;
alter table public.resources add constraint resources_type_check
  check (type in ('article', 'pdf', 'video', 'ebook', 'outil'));

-- Prix en centimes, uniquement pour les ressources payantes (is_free = false).
alter table public.resources add column price int;

-- Achats de ressources payantes : pas de compte requis (nom + email au moment du paiement),
-- livraison par email avec lien Drive (content_url) — pas d'espace "mes ressources" côté élève.
create table public.resource_purchases (
  id                 uuid primary key default gen_random_uuid(),
  resource_id        uuid not null references public.resources(id) on delete cascade,
  nom                text not null,
  email              text not null,
  montant            int not null,  -- centimes
  stripe_session_id  text not null unique,
  created_at         timestamptz not null default now()
);

create index idx_resource_purchases_resource_id on public.resource_purchases(resource_id);

alter table public.resource_purchases enable row level security;
-- resource_purchases : admin/service_role uniquement (pas de policy, comme cpf_students)

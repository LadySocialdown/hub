-- ============================================================
-- ESPACE FORMATION — 3 zones cloisonnées (La Petite Académie, Level Up, Next Level)
-- ============================================================

-- Courses gagnent un slug stable pour le routing (/dashboard/formation/[slug])
alter table public.courses add column slug text;

-- Modules : vidéos hébergées sur YouTube (non répertorié), pas Mux
alter table public.modules drop column mux_video_id;
alter table public.modules add column youtube_video_id text;

-- ============================================================
-- ACCÈS FORMATION
-- ============================================================

-- Accès effectif d'un élève (compte Clerk existant) à une formation.
create table public.course_enrollments (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null references public.users(id) on delete cascade,
  course_id   uuid not null references public.courses(id) on delete cascade,
  granted_by  text not null check (granted_by in ('stripe', 'admin')),
  created_at  timestamptz not null default now(),
  unique (user_id, course_id)
);

create index idx_course_enrollments_user_id on public.course_enrollments(user_id);

-- Accès octroyé avant la création du compte (email seul) : invitation Clerk en attente
-- de finalisation. Liée à course_enrollments une fois le compte créé (voir webhook Clerk).
create table public.formation_invitations (
  id                   uuid primary key default gen_random_uuid(),
  email                text not null,
  course_id            uuid not null references public.courses(id) on delete cascade,
  clerk_invitation_id  text,
  granted_by           text not null check (granted_by in ('stripe', 'admin')),
  status               text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at           timestamptz not null default now(),
  accepted_at          timestamptz
);

create index idx_formation_invitations_email on public.formation_invitations(lower(email));

alter table public.course_enrollments enable row level security;
alter table public.formation_invitations enable row level security;

create policy "enrollments_select_own" on public.course_enrollments
  for select using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- formation_invitations : admin/service_role uniquement (pas de policy, comme cpf_students)

alter table public.courses add constraint courses_slug_unique unique (slug);

-- ============================================================
-- SEED — les 3 formations
-- ============================================================

insert into public.courses (title, slug, is_flagship, total_modules) values
  ('La Petite Académie', 'petite-academie', false, 8),
  ('Level Up', 'level-up', false, 7),
  ('Next Level', 'next-level', false, 7);

alter table public.courses alter column slug set not null;

-- La Petite Académie : 8 modules déjà définis (contenu Notion)
insert into public.modules (course_id, title, position, unlock_week)
select c.id, m.title, m.position, 0
from public.courses c
cross join (values
  ('Les fondations du social media', 1),
  ('Clarifier son positionnement', 2),
  ('Structurer son écosystème digital', 3),
  ('Construire sa marque personnelle', 4),
  ('Créer du contenu stratégique', 5),
  ('Transformer l''audience en clients', 6),
  ('Optimiser et scaler', 7),
  ('Bonus — Masterclass live', 8)
) as m(title, position)
where c.slug = 'petite-academie';

-- Level Up & Next Level : même programme flagship 7 modules dans les deux offres
insert into public.modules (course_id, title, position, unlock_week)
select c.id, m.title, m.position, 0
from public.courses c
cross join (values
  ('Définir ses objectifs commerciaux', 1),
  ('Choisir ses réseaux sociaux', 2),
  ('Développer sa présence en ligne', 3),
  ('Planifier ses publications', 4),
  ('Créer du contenu engageant', 5),
  ('Produire des vidéos promotionnelles', 6),
  ('Analyser ses performances', 7)
) as m(title, position)
where c.slug in ('level-up', 'next-level');

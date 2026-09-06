-- ============================================================
-- LEÇONS — plusieurs vidéos par module (remplace la colonne unique
-- modules.youtube_video_id) + progression au niveau de la leçon.
-- ============================================================

create table public.lessons (
  id                uuid primary key default gen_random_uuid(),
  module_id         uuid not null references public.modules(id) on delete cascade,
  title             text not null,
  position          int not null,
  youtube_video_id  text,
  created_at        timestamptz not null default now()
);

create index idx_lessons_module_id on public.lessons(module_id, position);

-- Remplace user_progress : un élève termine des leçons, pas directement des modules
-- (un module est "terminé" quand toutes ses leçons le sont).
create table public.lesson_progress (
  id            uuid primary key default gen_random_uuid(),
  user_id       text not null references public.users(id) on delete cascade,
  lesson_id     uuid not null references public.lessons(id) on delete cascade,
  completed     boolean not null default false,
  completed_at  timestamptz,
  unique (user_id, lesson_id)
);

create index idx_lesson_progress_user_id on public.lesson_progress(user_id);

alter table public.lessons enable row level security;
alter table public.lesson_progress enable row level security;

create policy "lesson_progress_select_own" on public.lesson_progress
  for select using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- ============================================================
-- SEED — séquences du programme flagship (Level Up & Next Level, 7 modules communs)
-- ============================================================

insert into public.lessons (module_id, title, position)
select m.id, s.title, s.seq_position
from public.courses c
join public.modules m on m.course_id = c.id
join (values
  (1, 1, 'Introduction aux Réseaux Sociaux pour le Développement Commercial'),
  (1, 2, 'Définition des Objectifs Commerciaux SMART'),
  (1, 3, 'Identification et Analyse de la Cible'),
  (1, 4, 'Stratégie de Contenu et Planification'),
  (1, 5, 'Mesure de Performance et Adaptation'),
  (2, 1, 'Fondamentaux de la Stratégie sur les Réseaux Sociaux'),
  (2, 2, 'Audit et Stratégie de Sélection des Réseaux Sociaux'),
  (2, 3, 'Fonctionnalités et Gestion des Réseaux Sociaux'),
  (2, 4, 'La Publicité sur les Réseaux Sociaux'),
  (3, 1, 'Fondamentaux de la Création de Comptes Entreprise'),
  (3, 2, 'Engagement et Croissance de la Communauté'),
  (3, 3, 'Analyse et Amélioration Continues'),
  (3, 4, 'Tendances Émergentes et Avenir des Plateformes Sociales'),
  (4, 1, 'Introduction à la Planification des Publications'),
  (4, 2, 'Élaboration d''un Calendrier Éditorial'),
  (4, 3, 'Optimisation des Horaires de Publication'),
  (4, 4, 'Gestion et Automatisation des Publications'),
  (4, 5, 'Bonnes Pratiques et Stratégies Avancées'),
  (5, 1, 'Principes de Création de Contenus pour les Réseaux Sociaux'),
  (5, 2, 'Storytelling et Engagement Visuel'),
  (5, 3, 'Stratégies de Contenu et Social Advertising'),
  (5, 4, 'Valorisation et Fidélisation de la Communauté'),
  (6, 1, 'Fondamentaux de la Vidéo pour les Réseaux Sociaux'),
  (6, 2, 'Préparation à la Production de Vidéo'),
  (6, 3, 'Techniques de Production Vidéo'),
  (6, 4, 'Montage et Diffusion de la Vidéo'),
  (7, 1, 'Introduction aux Indicateurs de Performance'),
  (7, 2, 'Outils d''Analyse et de Suivi'),
  (7, 3, 'Interprétation des Données et Ajustement des Stratégies'),
  (7, 4, 'Gestion de la E-réputation et Interaction avec la Communauté')
) as s(module_position, seq_position, title)
  on m.position = s.module_position
where c.slug in ('level-up', 'next-level');

-- Reprend une vidéo déjà renseignée par Sania sur le programme flagship : elle est
-- rattachée à la première séquence du module concerné plutôt que d'être perdue.
update public.lessons l
set youtube_video_id = m.youtube_video_id
from public.modules m
where l.module_id = m.id
  and l.position = 1
  and m.youtube_video_id is not null;

-- La Petite Académie (et toute autre formation hors flagship) : reprend la vidéo unique
-- déjà renseignée en une leçon "Vidéo 1", à défaut de séquences détaillées.
insert into public.lessons (module_id, title, position, youtube_video_id)
select m.id, 'Vidéo 1', 1, m.youtube_video_id
from public.modules m
join public.courses c on c.id = m.course_id
where m.youtube_video_id is not null
  and c.slug not in ('level-up', 'next-level');

-- Reprend la progression existante (par module) vers la leçon "Vidéo 1" correspondante.
insert into public.lesson_progress (user_id, lesson_id, completed, completed_at)
select up.user_id, l.id, up.completed, up.completed_at
from public.user_progress up
join public.lessons l on l.module_id = up.module_id and l.position = 1
where up.completed = true;

alter table public.modules drop column youtube_video_id;
drop table public.user_progress;

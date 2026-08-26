-- ============================================================
-- RESSOURCES — catégories (Guides PDF, Templates, Replays, Articles) + description
-- ============================================================

alter table public.resources add column description text;

alter table public.resources drop constraint resources_type_check;
alter table public.resources add constraint resources_type_check
  check (type in ('article', 'pdf', 'video', 'ebook', 'outil', 'template'));

-- Contenu de lancement gratuit (compte requis pour télécharger, voir /ressources).
-- content_url reste vide : à compléter par Sania via /admin/contenus une fois les
-- fichiers prêts — la page affiche "Bientôt disponible" en attendant.
insert into public.resources (title, type, description, is_free) values
  (
    '50 hooks qui arrêtent le scroll',
    'pdf',
    'Un recueil de 50 accroches prêtes à l''emploi pour capter l''attention dès les 3 premières secondes.',
    true
  ),
  (
    'Diagnostic Instagram en 5 minutes',
    'pdf',
    'Une checklist d''auto-diagnostic pour repérer rapidement ce qui bloque sur son compte (bio, contenu, fréquence, engagement).',
    true
  ),
  (
    'Publicité : le guide complet',
    'pdf',
    'Tout ce qu''il faut savoir avant de lancer sa première campagne publicitaire sur les réseaux sociaux.',
    true
  ),
  (
    'La story qui vend',
    'pdf',
    'Guide pratique sur les mécaniques concrètes pour vendre en story sans être lourde.',
    true
  ),
  (
    'Ta boîte à prompts IA',
    'template',
    'Une bibliothèque de prompts Claude prêts à l''emploi pour créer du contenu plus vite, en gardant sa propre voix.',
    true
  ),
  (
    'Ton Hub Business',
    'template',
    'Template Notion tout-en-un : calendrier éditorial, banque d''idées de contenu, suivi des offres et objectifs, suivi des indicateurs clés.',
    true
  );

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================
-- USERS
-- ============================================================
create table public.users (
  id           text primary key,  -- Clerk user ID
  email        text not null unique,
  name         text,
  role         text not null default 'user' check (role in ('user', 'admin')),
  subscription_status text check (subscription_status in ('active', 'past_due', 'canceled', 'trialing')),
  created_at   timestamptz not null default now()
);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
create table public.subscriptions (
  id             uuid primary key default gen_random_uuid(),
  user_id        text not null references public.users(id) on delete cascade,
  plan           text not null check (plan in ('starter', 'essentielle', 'vip')),
  stripe_sub_id  text not null unique,
  status         text not null check (status in ('active', 'past_due', 'canceled', 'trialing')),
  period_end     timestamptz not null,
  created_at     timestamptz not null default now()
);

-- ============================================================
-- COURSES & MODULES
-- ============================================================
create table public.courses (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  total_modules int not null default 0,
  is_flagship   boolean not null default false,
  created_at    timestamptz not null default now()
);

create table public.modules (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references public.courses(id) on delete cascade,
  title         text not null,
  unlock_week   int not null default 0,
  mux_video_id  text,
  resources     jsonb not null default '[]',
  position      int not null default 0,
  created_at    timestamptz not null default now()
);

create index idx_modules_course_id on public.modules(course_id);

create table public.user_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      text not null references public.users(id) on delete cascade,
  module_id    uuid not null references public.modules(id) on delete cascade,
  completed    boolean not null default false,
  completed_at timestamptz,
  unique (user_id, module_id)
);

-- ============================================================
-- TOOLS
-- ============================================================
create table public.tools (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  type       text not null check (type in ('template', 'guide', 'video')),
  url        text not null,
  is_premium boolean not null default false,
  tags       text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- ============================================================
-- PURCHASES
-- ============================================================
create table public.purchases (
  id                 uuid primary key default gen_random_uuid(),
  user_id            text not null references public.users(id) on delete cascade,
  item_type          text not null,
  item_id            text not null,
  stripe_payment_id  text not null unique,
  amount             int not null,  -- centimes
  created_at         timestamptz not null default now()
);

create index idx_purchases_user_id on public.purchases(user_id);

-- ============================================================
-- BOOKINGS (Coaching & Mentorat)
-- ============================================================
create table public.bookings (
  id                 uuid primary key default gen_random_uuid(),
  user_id            text not null references public.users(id) on delete cascade,
  session_type       text not null check (session_type in ('coaching', 'mentorat')),
  cal_event_id       text,
  stripe_payment_id  text,
  status             text not null default 'pending' check (status in ('pending', 'confirmed', 'canceled', 'completed')),
  scheduled_at       timestamptz,
  created_at         timestamptz not null default now()
);

create index idx_bookings_user_id on public.bookings(user_id);

-- ============================================================
-- FREE RESOURCES
-- ============================================================
create table public.resources (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  type        text not null check (type in ('article', 'pdf', 'video')),
  is_free     boolean not null default true,
  content_url text,
  tags        text[] not null default '{}',
  created_at  timestamptz not null default now()
);

-- ============================================================
-- CPF STUDENTS
-- ============================================================
create table public.cpf_students (
  id              uuid primary key default gen_random_uuid(),
  user_id         text references public.users(id) on delete set null,
  program         text not null check (program in ('25h', '35h')),
  nom             text not null,
  prenom          text not null,
  email           text not null,
  telephone       text not null,
  adresse         text not null,
  mcf_dossier_id  text,
  statut_dossier  text not null default 'en_attente',
  documents       jsonb not null default '[]',
  created_at      timestamptz not null default now()
);

-- ============================================================
-- INSTALLMENT PLANS (paiement fractionné CPF)
-- ============================================================
create table public.installment_plans (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 text not null references public.users(id) on delete cascade,
  total_amount            int not null,   -- centimes
  installments            int not null check (installments in (3, 4)),
  paid_count              int not null default 0,
  next_payment_date       timestamptz,
  stripe_setup_intent_id  text,
  status                  text not null default 'active' check (status in ('active', 'completed', 'failed', 'canceled')),
  created_at              timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.users enable row level security;
alter table public.subscriptions enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.user_progress enable row level security;
alter table public.tools enable row level security;
alter table public.purchases enable row level security;
alter table public.bookings enable row level security;
alter table public.resources enable row level security;
alter table public.cpf_students enable row level security;
alter table public.installment_plans enable row level security;

-- Users: read own row only
create policy "users_select_own" on public.users
  for select using (id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "users_insert_own" on public.users
  for insert with check (id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Subscriptions: read own
create policy "subscriptions_select_own" on public.subscriptions
  for select using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Courses + Modules: public read
create policy "courses_select_all" on public.courses for select using (true);
create policy "modules_select_all" on public.modules for select using (true);

-- User progress: own only
create policy "progress_select_own" on public.user_progress
  for select using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "progress_insert_own" on public.user_progress
  for insert with check (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "progress_update_own" on public.user_progress
  for update using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Tools: public read
create policy "tools_select_all" on public.tools for select using (true);

-- Purchases: own only
create policy "purchases_select_own" on public.purchases
  for select using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Bookings: own only
create policy "bookings_select_own" on public.bookings
  for select using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "bookings_insert_own" on public.bookings
  for insert with check (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "bookings_update_own" on public.bookings
  for update using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Resources: public read
create policy "resources_select_all" on public.resources for select using (true);

-- CPF students: admin only via service_role (no anon/user access)
-- (service_role bypasses RLS — no policy needed for admin operations)

-- Installment plans: own only
create policy "installments_select_own" on public.installment_plans
  for select using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

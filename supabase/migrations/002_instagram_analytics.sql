-- ============================================================
-- INSTAGRAM ANALYTICS (Lady Socialdown — @ladysocialdown)
-- ============================================================

-- Singleton settings row: reference date for the J+7/15/21/30 cycle,
-- and the highest milestone (day offset from reference_date) analyzed so far.
create table public.instagram_settings (
  id                 int primary key default 1,
  reference_date     date not null,
  last_milestone_day int not null default 0,
  created_at         timestamptz not null default now(),
  constraint instagram_settings_singleton check (id = 1)
);

create table public.instagram_daily_snapshots (
  date                  date primary key,
  reach                 integer not null default 0,
  views                 integer not null default 0,
  likes                 integer not null default 0,
  comments              integer not null default 0,
  shares                integer not null default 0,
  saves                 integer not null default 0,
  total_interactions    integer not null default 0,
  new_followers         integer not null default 0,
  follows_and_unfollows integer not null default 0,
  estimated_unfollows   integer not null default 0,
  net_follower_change   integer not null default 0,
  created_at            timestamptz not null default now()
);

create table public.instagram_reports (
  id                  uuid primary key default gen_random_uuid(),
  period_type         text not null, -- '7j' | '15j' | '21j' | '30j' | 'manuel'
  period_start        date not null,
  period_end          date not null,
  generated_at         timestamptz not null default now(),
  raw_metrics_json    jsonb not null,   -- toutes les données calculées (section 2)
  interpretation_text text,             -- réponse de Claude (section 4)
  created_at          timestamptz not null default now()
);

create index idx_instagram_reports_period_end on public.instagram_reports(period_end desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
-- Admin-only via service_role (no anon/user access) — same pattern as cpf_students.
alter table public.instagram_settings enable row level security;
alter table public.instagram_daily_snapshots enable row level security;
alter table public.instagram_reports enable row level security;

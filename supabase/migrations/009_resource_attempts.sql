-- Resource attempts: stores every interactive resource session per student.
-- One row per (user, resource, attempt number).
create table public.resource_attempts (
  id              uuid primary key default gen_random_uuid(),
  user_id         text not null references public.users(id) on delete cascade,
  resource_id     text not null,
  resource_version int not null default 1,
  attempt         int not null default 1,
  answers         jsonb not null default '{}',
  computed        jsonb not null default '{}',
  current_step    text,
  completed_at    timestamptz,
  updated_at      timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  unique (user_id, resource_id, attempt)
);

create index idx_resource_attempts_user on public.resource_attempts(user_id);
create index idx_resource_attempts_resource on public.resource_attempts(resource_id);

alter table public.resource_attempts enable row level security;

create policy "resource_attempts_select_own" on public.resource_attempts
  for select using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "resource_attempts_insert_own" on public.resource_attempts
  for insert with check (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "resource_attempts_update_own" on public.resource_attempts
  for update using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

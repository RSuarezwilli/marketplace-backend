-- Migración: tabla public.users, espejo local de auth.users (Supabase Auth)
-- Se mantiene sincronizada mediante el webhook de Auth Hooks
-- (ver src/interfaces/http/routes/webhookRoutes.ts + UserSyncService).

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'buyer' check (role in ('buyer', 'seller', 'admin')),
  status text not null default 'active' check (status in ('active', 'inactive', 'banned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_users_auth_user_id on public.users (auth_user_id);
create index if not exists idx_users_email on public.users (email);

-- Seguridad: Row Level Security habilitado. El backend usa la Service Role
-- Key (que bypassa RLS) exclusivamente para la sincronización vía webhook;
-- el resto del tráfico (clientes) queda acotado por estas políticas.
alter table public.users enable row level security;

create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = auth_user_id);

create policy "Users can update their own profile (non-privileged fields)"
  on public.users for update
  using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);

-- Trigger genérico para mantener updated_at coherente ante cualquier UPDATE.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

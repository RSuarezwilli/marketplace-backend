-- Migración: tabla public.products (artículos publicados por vendedores)

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.users (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  description text not null check (char_length(description) between 10 and 2000),
  price numeric(12, 2) not null check (price > 0),
  stock integer not null default 0 check (stock >= 0),
  status text not null default 'available' check (status in ('available', 'reserved', 'sold', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_seller_id on public.products (seller_id);
create index if not exists idx_products_status on public.products (status);

alter table public.products enable row level security;

create policy "Anyone can view available products"
  on public.products for select
  using (status = 'available' or seller_id = (select id from public.users where auth_user_id = auth.uid()));

create policy "Sellers can insert their own products"
  on public.products for insert
  with check (seller_id = (select id from public.users where auth_user_id = auth.uid()));

create policy "Sellers can update their own products"
  on public.products for update
  using (seller_id = (select id from public.users where auth_user_id = auth.uid()));

create policy "Sellers can delete their own products"
  on public.products for delete
  using (seller_id = (select id from public.users where auth_user_id = auth.uid()));

create trigger trg_products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

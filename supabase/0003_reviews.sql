-- Migración: tabla public.reviews (reseñas de compradores sobre vendedores)

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references public.users (id) on delete cascade,
  seller_id uuid not null references public.users (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  constraint reviews_no_self_review check (reviewer_id <> seller_id)
);

create index if not exists idx_reviews_seller_id on public.reviews (seller_id);
create index if not exists idx_reviews_reviewer_id on public.reviews (reviewer_id);

alter table public.reviews enable row level security;

create policy "Anyone can view reviews"
  on public.reviews for select
  using (true);

create policy "Authenticated users can create their own reviews"
  on public.reviews for insert
  with check (reviewer_id = (select id from public.users where auth_user_id = auth.uid()));
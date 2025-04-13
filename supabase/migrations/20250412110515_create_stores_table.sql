-- Create 'stores' table
create table if not exists public.stores (
  id uuid primary key default uuid_generate_v4(),
  shop_domain text unique not null,
  access_token text not null,
  sync_status text default 'pending',
  sync_started_at timestamp with time zone,
  sync_finished_at timestamp with time zone,
  plan text default 'free',
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row-Level Security
alter table public.stores enable row level security;

-- RLS Policy: A store can access only its own record
create policy "Allow individual store access to their own data"
  on public.stores
  for all
  using (auth.uid()::uuid = id);

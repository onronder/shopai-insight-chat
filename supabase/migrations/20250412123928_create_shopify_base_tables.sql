-- Create independent tables first
create table if not exists shopify_stores (
  id uuid primary key default uuid_generate_v4(),
  domain text not null unique,
  access_token text,
  created_at timestamp with time zone default now()
);

create table if not exists shopify_customers (
  id uuid primary key default uuid_generate_v4(),
  shopify_customer_id text not null,
  email text,
  first_name text,
  last_name text,
  created_at timestamp with time zone default now()
);

create table if not exists shopify_products (
  id uuid primary key default uuid_generate_v4(),
  shopify_product_id text not null,
  title text,
  created_at timestamp with time zone default now()
);

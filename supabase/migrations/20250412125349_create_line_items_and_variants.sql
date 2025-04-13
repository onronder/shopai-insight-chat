create table if not exists shopify_order_line_items (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid not null references shopify_stores(id) on delete cascade,
  order_id uuid not null references shopify_orders(id) on delete cascade,
  product_id uuid references shopify_products(id) on delete set null,
  variant_id uuid,
  title text,
  quantity integer,
  price numeric,
  discount numeric,
  created_at timestamp with time zone default now()
);


create table if not exists shopify_product_variants (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid not null references shopify_stores(id) on delete cascade,
  product_id uuid not null references shopify_products(id) on delete cascade,
  shopify_variant_id text not null,
  title text,
  sku text,
  price numeric,
  inventory_quantity integer,
  created_at timestamp with time zone default now()
);

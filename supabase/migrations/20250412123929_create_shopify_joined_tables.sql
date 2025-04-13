-- Now create tables that use FKs
create table if not exists shop_orders (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid not null references shopify_stores(id) on delete cascade,
  customer_id uuid references shopify_customers(id) on delete set null,
  shopify_order_id text not null,
  total_price numeric,
  subtotal_price numeric,
  total_discount numeric,
  currency text,
  financial_status text,
  fulfillment_status text,
  processed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

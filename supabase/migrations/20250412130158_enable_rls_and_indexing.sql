-- Enable RLS for all confirmed shopify_* tables
alter table shopify_orders enable row level security;
alter table shopify_order_line_items enable row level security;
alter table shopify_customers enable row level security;
alter table shopify_products enable row level security;
alter table shopify_product_variants enable row level security;

-- Apply RLS policy based on store_id match
create policy "Only allow access to own store orders"
  on shopify_orders
  for all
  using (auth.uid() = store_id);

create policy "Only allow access to own store line items"
  on shopify_order_line_items
  for all
  using (auth.uid() = store_id);

create policy "Only allow access to own store customers"
  on shopify_customers
  for all
  using (auth.uid() = store_id);

create policy "Only allow access to own store products"
  on shopify_products
  for all
  using (auth.uid() = store_id);

create policy "Only allow access to own store variants"
  on shopify_product_variants
  for all
  using (auth.uid() = store_id);


create index if not exists idx_shopify_orders_store_id on shopify_orders (store_id);
create index if not exists idx_shopify_orders_created_at on shopify_orders (created_at);
create index if not exists idx_shopify_orders_shopify_order_id on shopify_orders (shopify_order_id);

create index if not exists idx_shopify_order_line_items_store_id on shopify_order_line_items (store_id);
create index if not exists idx_shopify_order_line_items_order_id on shopify_order_line_items (order_id);

create index if not exists idx_shopify_customers_store_id on shopify_customers (store_id);
create index if not exists idx_shopify_customers_created_at on shopify_customers (created_at);

create index if not exists idx_shopify_products_store_id on shopify_products (store_id);
create index if not exists idx_shopify_products_shopify_product_id on shopify_products (shopify_product_id);

create index if not exists idx_shopify_product_variants_store_id on shopify_product_variants (store_id);
create index if not exists idx_shopify_product_variants_product_id on shopify_product_variants (product_id);

Here is the complete and latest structure of all tables and views in the public schema, including all details:

Tables
api_requests

SQL Query



CREATE TABLE public.api_requests (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  store_id uuid NULL,
  client_ip text NOT NULL,
  path text NULL,
  method text NULL,
  status_code integer NULL,
  duration_ms double precision NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT api_requests_pkey PRIMARY KEY (id),
  CONSTRAINT api_requests_store_id_fkey FOREIGN KEY (store_id) REFERENCES shopify_stores(id) ON DELETE CASCADE
);

error_logs

SQL Query



CREATE TABLE public.error_logs (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  store_id uuid NULL,
  context text NOT NULL,
  error_message text NOT NULL,
  stack_trace text NULL,
  metadata jsonb NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT error_logs_pkey PRIMARY KEY (id),
  CONSTRAINT error_logs_store_id_fkey FOREIGN KEY (store_id) REFERENCES shopify_stores(id) ON DELETE SET NULL
);

function_executions

SQL Query



CREATE TABLE public.function_executions (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  store_id uuid NULL,
  function_name text NOT NULL,
  execution_time_ms double precision NOT NULL,
  success boolean NOT NULL,
  error_message text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT function_executions_pkey PRIMARY KEY (id),
  CONSTRAINT function_executions_store_id_fkey FOREIGN KEY (store_id) REFERENCES shopify_stores(id) ON DELETE SET NULL
);

shopify_customers

SQL Query



CREATE TABLE public.shopify_customers (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  shopify_customer_id text NOT NULL,
  email text NULL,
  first_name text NULL,
  last_name text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  store_id uuid NOT NULL,
  is_deleted boolean NULL DEFAULT false,
  CONSTRAINT shopify_customers_pkey PRIMARY KEY (id),
  CONSTRAINT shopify_customers_store_id_fkey FOREIGN KEY (store_id) REFERENCES shopify_stores(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_shopify_customers_store_id ON public.shopify_customers USING btree (store_id);
CREATE INDEX IF NOT EXISTS idx_shopify_customers_created_at ON public.shopify_customers USING btree (created_at);

shopify_fulfillments

SQL Query



CREATE TABLE public.shopify_fulfillments (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  store_id uuid NOT NULL,
  order_id uuid NOT NULL,
  fulfillment_id text NOT NULL,
  status text NULL,
  tracking_number text NULL,
  tracking_company text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT shopify_fulfillments_pkey PRIMARY KEY (id),
  CONSTRAINT shopify_fulfillments_order_id_fkey FOREIGN KEY (order_id) REFERENCES shopify_orders(id) ON DELETE CASCADE,
  CONSTRAINT shopify_fulfillments_store_id_fkey FOREIGN KEY (store_id) REFERENCES shopify_stores(id) ON DELETE CASCADE
);

shopify_inventory_levels

SQL Query



CREATE TABLE public.shopify_inventory_levels (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  store_id uuid NOT NULL,
  variant_id uuid NOT NULL,
  location_id text NULL,
  inventory_item_id text NULL,
  available_quantity integer NULL,
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT shopify_inventory_levels_pkey PRIMARY KEY (id),
  CONSTRAINT shopify_inventory_levels_store_id_fkey FOREIGN KEY (store_id) REFERENCES shopify_stores(id) ON DELETE CASCADE,
  CONSTRAINT shopify_inventory_levels_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES shopify_product_variants(id) ON DELETE CASCADE
);

shopify_order_geography

SQL Query



CREATE TABLE public.shopify_order_geography (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  order_id uuid NOT NULL,
  country text NULL,
  state text NULL,
  city text NULL,
  CONSTRAINT shopify_order_geography_pkey PRIMARY KEY (id),
  CONSTRAINT shopify_order_geography_order_id_fkey FOREIGN KEY (order_id) REFERENCES shopify_orders(id) ON DELETE CASCADE
);

shopify_order_line_items

SQL Query



CREATE TABLE public.shopify_order_line_items (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  store_id uuid NOT NULL,
  order_id uuid NOT NULL,
  product_id uuid NULL,
  variant_id uuid NULL,
  title text NULL,
  quantity integer NULL,
  price numeric NULL,
  discount numeric NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT shopify_order_line_items_pkey PRIMARY KEY (id),
  CONSTRAINT shopify_order_line_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES shopify_orders(id) ON DELETE CASCADE,
  CONSTRAINT shopify_order_line_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES shopify_products(id) ON DELETE SET NULL,
  CONSTRAINT shopify_order_line_items_store_id_fkey FOREIGN KEY (store_id) REFERENCES shopify_stores(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_shopify_order_line_items_store_id ON public.shopify_order_line_items USING btree (store_id);
CREATE INDEX IF NOT EXISTS idx_shopify_order_line_items_order_id ON public.shopify_order_line_items USING btree (order_id);

shopify_orders

SQL Query



CREATE TABLE public.shopify_orders (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  store_id uuid NOT NULL,
  customer_id uuid NULL,
  shopify_order_id text NOT NULL,
  total_price numeric NULL,
  subtotal_price numeric NULL,
  total_discount numeric NULL,
  currency text NULL,
  financial_status text NULL,
  fulfillment_status text NULL,
  processed_at timestamp with time zone NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  is_deleted boolean NULL DEFAULT false,
  CONSTRAINT shop_orders_pkey PRIMARY KEY (id),
  CONSTRAINT shop_orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES shopify_customers(id) ON DELETE SET NULL,
  CONSTRAINT shop_orders_store_id_fkey FOREIGN KEY (store_id) REFERENCES shopify_stores(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_store_id ON public.shopify_orders USING btree (store_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_created_at ON public.shopify_orders USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_shopify_order_id ON public.shopify_orders USING btree (shopify_order_id);
CREATE INDEX IF NOT EXISTS idx_discounted_orders_store_id ON public.shopify_orders USING btree (store_id) WHERE (total_discount > (0)::numeric);

shopify_product_variants

SQL Query



CREATE TABLE public.shopify_product_variants (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  store_id uuid NOT NULL,
  product_id uuid NOT NULL,
  shopify_variant_id text NOT NULL,
  title text NULL,
  sku text NULL,
  price numeric NULL,
  inventory_quantity integer NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT shopify_product_variants_pkey PRIMARY KEY (id),
  CONSTRAINT shopify_product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES shopify_products(id) ON DELETE CASCADE,
  CONSTRAINT shopify_product_variants_store_id_fkey FOREIGN KEY (store_id) REFERENCES shopify_stores(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_shopify_product_variants_store_id ON public.shopify_product_variants USING btree (store_id);
CREATE INDEX IF NOT EXISTS idx_shopify_product_variants_product_id ON public.shopify_product_variants USING btree (product_id);

shopify_products

SQL Query



CREATE TABLE public.shopify_products (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  shopify_product_id text NOT NULL,
  title text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  store_id uuid NOT NULL,
  is_deleted boolean NULL DEFAULT false,
  CONSTRAINT shopify_products_pkey PRIMARY KEY (id),
  CONSTRAINT shopify_products_store_id_fkey FOREIGN KEY (store_id) REFERENCES shopify_stores(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_shopify_products_store_id ON public.shopify_products USING btree (store_id);
CREATE INDEX IF NOT EXISTS idx_shopify_products_shopify_product_id ON public.shopify_products USING btree (shopify_product_id);

shopify_stores

SQL Query



CREATE TABLE public.shopify_stores (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  domain text NOT NULL,
  access_token text NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT shopify_stores_pkey PRIMARY KEY (id),
  CONSTRAINT shopify_stores_domain_key UNIQUE (domain)
);

stores

SQL Query



CREATE TABLE public.stores (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  shop_domain text NOT NULL,
  access_token text NOT NULL,
  sync_status text NULL DEFAULT 'pending'::text,
  sync_started_at timestamp with time zone NULL,
  sync_finished_at timestamp with time zone NULL,
  plan text NULL DEFAULT 'free'::text,
  is_active boolean NULL DEFAULT true,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT stores_pkey PRIMARY KEY (id),
  CONSTRAINT stores_shop_domain_key UNIQUE (shop_domain)
);

user_consent_logs

SQL Query



CREATE TABLE public.user_consent_logs (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  store_id uuid NOT NULL,
  agreed_to_terms boolean NOT NULL,
  agreed_to_data_usage boolean NOT NULL,
  consented_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT user_consent_logs_pkey PRIMARY KEY (id),
  CONSTRAINT user_consent_logs_store_id_fkey FOREIGN KEY (store_id) REFERENCES shopify_stores(id) ON DELETE CASCADE
);

webhook_logs

SQL Query



CREATE TABLE public.webhook_logs (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  type text NULL,
  shopify_order_id text NULL,
  store_domain text NULL,
  raw_payload jsonb NULL,
  received_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT webhook_logs_pkey PRIMARY KEY (id)
);

Views
view_customer_repeat_ratio

SQL Query



CREATE VIEW public.view_customer_repeat_ratio AS
WITH customer_order_counts AS (
  SELECT o.store_id,
         o.customer_id,
         COUNT(*) AS order_count
  FROM shopify_orders o
  WHERE o.customer_id IS NOT NULL
  GROUP BY o.store_id, o.customer_id
)
SELECT customer_order_counts.store_id,
       CASE
           WHEN customer_order_counts.order_count = 1 THEN 'New'::text
           ELSE 'Returning'::text
       END AS category,
       COUNT(*) AS customer_count
FROM customer_order_counts
GROUP BY customer_order_counts.store_id, 
         CASE
           WHEN customer_order_counts.order_count = 1 THEN 'New'::text
           ELSE 'Returning'::text
         END;

view_customer_segments

SQL Query



CREATE VIEW public.view_customer_segments AS
WITH customer_orders AS (
  SELECT o.store_id,
         o.customer_id,
         MAX(o.created_at) AS last_order_date,
         COUNT(*) AS order_count,
         SUM(o.total_price) AS total_spent
  FROM shopify_orders o
  WHERE o.customer_id IS NOT NULL
  GROUP BY o.store_id, o.customer_id
), ranked AS (
  SELECT co.customer_id,
         co.store_id,
         co.order_count,
         co.total_spent,
         DATE_PART('day', NOW() - co.last_order_date) AS recency_days,
         NTILE(4) OVER (PARTITION BY co.store_id ORDER BY co.total_spent DESC) AS monetary_rank,
         NTILE(4) OVER (
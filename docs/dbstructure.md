Here is the complete structure of all tables, views, and project objects in the public schema:

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
  access_token text NULL,
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
         NTILE(4) OVER (PARTITION BY co.store_id ORDER BY co.order_count DESC) AS frequency_rank,
         NTILE(4) OVER (PARTITION BY co.store_id ORDER BY co.last_order_date DESC) AS recency_rank
  FROM customer_orders co
)
SELECT r.customer_id,
       r.store_id,
       r.recency_days,
       r.order_count,
       r.total_spent,
       CASE
           WHEN r.monetary_rank = 1 AND r.frequency_rank = 1 THEN 'High Value'::text
           WHEN r.recency_rank = 4 THEN 'At Risk'::text
           WHEN r.frequency_rank = 1 THEN 'Loyal'::text
           WHEN r.frequency_rank = 4 AND r.monetary_rank = 4 THEN 'Low Engagement'::text
           ELSE 'Standard'::text
       END AS segment
FROM ranked r;

view_dashboard_summary

SQL Query



CREATE VIEW public.view_dashboard_summary AS
SELECT o.store_id,
       SUM(o.total_price) AS total_revenue,
       COUNT(o.id) AS total_orders,
       ROUND(AVG(o.total_price), 2) AS avg_order_value,
       (SELECT COUNT(*) AS count
        FROM (SELECT shopify_orders.customer_id,
                     MIN(shopify_orders.created_at) AS first_order_date
              FROM shopify_orders
              WHERE shopify_orders.customer_id IS NOT NULL
              GROUP BY shopify_orders.customer_id
              HAVING MIN(shopify_orders.created_at) >= (NOW() - '30 days'::interval)) new_cust
         WHERE (new_cust.customer_id IN (SELECT shopify_customers.id
                                          FROM shopify_customers
                                          WHERE shopify_customers.store_id = o.store_id))) AS new_customers,
       'last_30_days'::text AS date_range
FROM shopify_orders o
WHERE o.created_at >= (NOW() - '30 days'::interval)
GROUP BY o.store_id;

view_ltv_distribution

SQL Query



CREATE VIEW public.view_ltv_distribution AS
WITH customer_ltv AS (
  SELECT o.store_id,
         o.customer_id,
         SUM(o.total_price) AS lifetime_value
  FROM shopify_orders o
  WHERE o.customer_id IS NOT NULL
  GROUP BY o.store_id, o.customer_id
), bucketed AS (
  SELECT customer_ltv.store_id,
         CASE
             WHEN customer_ltv.lifetime_value < 50::numeric THEN 'Under $50'::text
             WHEN customer_ltv.lifetime_value < 100::numeric THEN '$50–$99'::text
             WHEN customer_ltv.lifetime_value < 200::numeric THEN '$100–$199'::text
             WHEN customer_ltv.lifetime_value < 500::numeric THEN '$200–$499'::text
             ELSE '$500+'::text
         END AS ltv_bucket
  FROM customer_ltv
)
SELECT bucketed.store_id,
       bucketed.ltv_bucket,
       COUNT(*) AS customer_count
FROM bucketed
GROUP BY bucketed.store_id, bucketed.ltv_bucket
ORDER BY bucketed.ltv_bucket;

view_sales_over_time

SQL Query



CREATE VIEW public.view_sales_over_time AS
SELECT o.store_id,
       DATE_TRUNC('day', o.created_at) AS day,
       SUM(o.total_price) AS daily_revenue,
       COUNT(o.id) AS daily_orders
FROM shopify_orders o
WHERE o.created_at >= (NOW() - '30 days'::interval)
GROUP BY o.store_id, DATE_TRUNC('day', o.created_at)
ORDER BY DATE_TRUNC('day', o.created_at);

view_top_products

SQL Query



CREATE VIEW public.view_top_products AS
SELECT li.store_id,
       p.title AS product_title,
       SUM(li.quantity) AS units_sold,
       SUM(li.price * li.quantity::numeric) AS total_revenue,
       ROUND(SUM(li.price * li.quantity::numeric) * 100.0 / NULLIF(SUM(SUM(li.price * li.quantity::numeric)) OVER (PARTITION BY li.store_id), 0::numeric), 2) AS percentage_of_total
FROM shopify_order_line_items li
JOIN shopify_products p ON p.id = li.product_id
WHERE li.created_at >= (NOW() - '30 days'::interval)
GROUP BY li.store_id, p.title
ORDER BY SUM(li.price * li.quantity::numeric) DESC
LIMIT 10;

vw_analytics_sales_overview

SQL Query



CREATE VIEW public.vw_analytics_sales_overview AS
SELECT shopify_orders.store_id,
       DATE_TRUNC('day', COALESCE(shopify_orders.processed_at, shopify_orders.created_at))::date AS day,
       SUM(shopify_orders.total_price) AS total,
       SUM(shopify_orders.subtotal_price) AS net,
       SUM(shopify_orders.total_discount) AS refunds,
       SUM(COALESCE(shopify_orders.total_price, 0::numeric) - COALESCE(shopify_orders.subtotal_price, 0::numeric)) AS tax
FROM shopify_orders
WHERE shopify_orders.is_deleted IS NOT TRUE
GROUP BY shopify_orders.store_id, DATE_TRUNC('day', COALESCE(shopify_orders.processed_at, shopify_orders.created_at))::date;

vw_analytics_summary

SQL Query



CREATE VIEW public.vw_analytics_summary AS
SELECT o.store_id,
       TO_CHAR(o.processed_at, 'YYYY-MM') AS period,
       DATE_TRUNC('month', o.processed_at) AS period_date,
       SUM(o.total_price) AS total,
       SUM(o.subtotal_price) AS net,
       SUM(o.total_discount) AS refunds,
       COUNT(*) AS order_count,
       COUNT(DISTINCT c.id) FILTER (WHERE first_order.processed_at IS NOT NULL AND first_order.processed_at >= (o.processed_at - '30 days'::interval)) AS new_customers,
       COUNT(DISTINCT c.id) FILTER (WHERE first_order.processed_at < (o.processed_at - '30 days'::interval)) AS repeat_customers
FROM shopify_orders o
LEFT JOIN shopify_customers c ON o.customer_id = c.id
LEFT JOIN LATERAL (
  SELECT MIN(shopify_orders.processed_at) AS processed_at
  FROM shopify_orders
  WHERE shopify_orders.customer_id = c.id
) first_order ON TRUE
WHERE o.is_deleted IS NOT TRUE
GROUP BY o.store_id, TO_CHAR(o.processed_at, 'YYYY-MM'), DATE_TRUNC('month', o.processed_at);

vw_customer_acquisition

SQL Query



CREATE VIEW public.vw_customer_acquisition AS
SELECT vw_customer_acquisition_raw.store_id,
       vw_customer_acquisition_raw.period,
       COUNT(*) AS new_customers
FROM vw_customer_acquisition_raw
GROUP BY vw_customer_acquisition_raw.store_id, vw_customer_acquisition_raw.period
ORDER BY vw_customer_acquisition_raw.period;

vw_customer_acquisition_raw

SQL Query



CREATE VIEW public.vw_customer_acquisition_raw AS
SELECT o.store_id,
       o.customer_id,
       DATE_TRUNC('month', MIN(o.created_at)) AS period,
       COUNT(*) AS total_orders
FROM shopify_orders o
WHERE o.customer_id IS NOT NULL
GROUP BY o.store_id, o.customer_id
HAVING COUNT(*) = 1;

vw_customer_churn_candidates

SQL Query



CREATE VIEW public.vw_customer_churn_candidates AS
SELECT c.id AS customer_id,
       c.store_id,
       MAX(o.created_at) AS last_order_at,
       DATE_PART('day', NOW() - MAX(o.created_at)) AS days_inactive
FROM shopify_customers c
LEFT JOIN shopify_orders o ON o.customer_id = c.id
GROUP BY c.id, c.store_id
HAVING MAX(o.created_at) IS NOT NULL AND MAX(o.created_at) < (NOW() - '45 days'::interval)
ORDER BY DATE_PART('day', NOW() - MAX(o.created_at)) DESC;

vw_discounted_orders

SQL Query



CREATE VIEW public.vw_discounted_orders AS
SELECT shopify_orders.id,
       shopify_orders.store_id,
       shopify_orders.shopify_order_id,
       shopify_orders.customer_id,
       shopify_orders.total_price,
       shopify_orders.subtotal_price,
       shopify_orders.total_discount,
       shopify_orders.currency,
       shopify_orders.created_at,
       shopify_orders.processed_at
FROM shopify_orders
WHERE shopify_orders.total_discount > 0::numeric
ORDER BY shopify_orders.created_at DESC;

vw_fulfillment_delays

SQL Query



CREATE VIEW public.vw_fulfillment_delays AS
SELECT o.store_id,
       o.id AS order_id,
       o.created_at,
       o.processed_at,
       o.total_price,
       ROUND((DATE_PART('day', o.processed_at - o.created_at) + DATE_PART('hour', o.processed_at - o.created_at) / 24.0::double precision)::numeric, 2) AS delay_days
FROM shopify_orders o
WHERE o.processed_at IS NOT NULL AND o.created_at IS NOT NULL AND o.processed_at > o.created_at
ORDER BY ROUND((DATE_PART('day', o.processed_at - o.created_at) + DATE_PART('hour', o.processed_at - o.created_at) / 24.0::double precision)::numeric, 2) DESC;

vw_function_usage_summary

SQL Query



CREATE VIEW public.vw_function_usage_summary AS
SELECT function_executions.store_id,
       function_executions.function_name,
       COUNT(*) AS call_count,
       ROUND(AVG(function_executions.execution_time_ms)::numeric, 2) AS avg_execution_time,
       ROUND(COUNT(*) FILTER (WHERE function_executions.success = true)::numeric * 100.0 / NULLIF(COUNT(*), 0)::numeric, 2) AS success_rate,
       DATE_TRUNC('day', function_executions.created_at) AS day
FROM function_executions
GROUP BY function_executions.store_id, function_executions.function_name, DATE_TRUNC('day', function_executions.created_at);

vw_order_status_distribution

SQL Query



CREATE VIEW public.vw_order_status_distribution AS
SELECT shopify_orders.store_id,
       COALESCE(shopify_orders.fulfillment_status, 'unknown'::text) AS status,
       COUNT(*) AS order_count
FROM shopify_orders
GROUP BY shopify_orders.store_id, COALESCE(shopify_orders.fulfillment_status, 'unknown'::text)
ORDER BY COUNT(*) DESC;

vw_sales_by_geo

SQL Query



CREATE VIEW public.vw_sales_by_geo AS
SELECT o.store_id,
       COALESCE(g.country, 'Unknown'::text) AS country,
       COALESCE(g.state, 'Unknown'::text) AS state,
       COALESCE(g.city, 'Unknown'::text) AS city,
       COUNT(DISTINCT o.id) AS total_orders,
       SUM(o.total_price) AS total_revenue,
       ROUND(AVG(o.total_price), 2) AS average_order_value,
       MAX(o.created_at) AS last_order_at
FROM shopify_orders o



After checking the database structure, here is a summary of the tables and views in the public schema:

Tables
api_requests
error_logs
function_executions
shopify_customers
shopify_fulfillments
shopify_inventory_levels
shopify_order_geography
shopify_order_line_items
shopify_orders
shopify_product_variants
shopify_products
shopify_stores
stores
user_consent_logs
webhook_logs

Views
view_customer_repeat_ratio
view_customer_segments
view_dashboard_summary
view_ltv_distribution
view_sales_over_time
view_top_products
vw_analytics_sales_overview
vw_analytics_summary
vw_customer_acquisition
vw_customer_acquisition_raw
vw_customer_churn_candidates
vw_discounted_orders
vw_fulfillment_delays
vw_function_usage_summary
vw_order_status_distribution
vw_sales_by_geo
vw_store_health_summary
vw_top_selling_products
vw_variant_sales_summary
vw_webhook_success_rate
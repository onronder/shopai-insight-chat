-- Create or replace sales overview view
CREATE OR REPLACE VIEW vw_analytics_sales_overview AS
SELECT
  DATE_TRUNC('day', o.created_at) AS date,
  COUNT(DISTINCT o.id) AS orders_count,
  COUNT(DISTINCT o.customer_id) AS customers_count,
  COALESCE(SUM(o.total_price), 0) AS revenue,
  COALESCE(SUM(o.total_price), 0) / NULLIF(COUNT(DISTINCT o.id), 0) AS average_order_value
FROM
  shopify_orders o
WHERE
  o.store_id IS NOT NULL
  AND o.is_deleted IS NOT TRUE
  AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY
  DATE_TRUNC('day', o.created_at)
ORDER BY
  DATE_TRUNC('day', o.created_at);

-- Create or replace funnel view
CREATE OR REPLACE VIEW vw_analytics_funnel AS
WITH page_views AS (
  SELECT
    DATE_TRUNC('day', created_at) AS date,
    COUNT(*) AS count
  FROM
    shopify_page_views
  WHERE
    created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY
    DATE_TRUNC('day', created_at)
),
add_to_carts AS (
  SELECT
    DATE_TRUNC('day', created_at) AS date,
    COUNT(*) AS count
  FROM
    shopify_add_to_carts
  WHERE
    created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY
    DATE_TRUNC('day', created_at)
),
checkouts AS (
  SELECT
    DATE_TRUNC('day', created_at) AS date,
    COUNT(*) AS count
  FROM
    shopify_checkouts
  WHERE
    created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY
    DATE_TRUNC('day', created_at)
),
orders AS (
  SELECT
    DATE_TRUNC('day', created_at) AS date,
    COUNT(*) AS count
  FROM
    shopify_orders
  WHERE
    is_deleted IS NOT TRUE
    AND created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY
    DATE_TRUNC('day', created_at)
)
SELECT
  COALESCE(pv.date, atc.date, co.date, o.date) AS date,
  COALESCE(pv.count, 0) AS page_views,
  COALESCE(atc.count, 0) AS add_to_carts,
  COALESCE(co.count, 0) AS checkouts,
  COALESCE(o.count, 0) AS orders
FROM
  page_views pv
FULL OUTER JOIN
  add_to_carts atc ON pv.date = atc.date
FULL OUTER JOIN
  checkouts co ON COALESCE(pv.date, atc.date) = co.date
FULL OUTER JOIN
  orders o ON COALESCE(pv.date, atc.date, co.date) = o.date
ORDER BY
  COALESCE(pv.date, atc.date, co.date, o.date);

-- Create or replace customer types view
CREATE OR REPLACE VIEW vw_analytics_customer_types AS
WITH customer_orders AS (
  SELECT
    customer_id,
    COUNT(*) AS order_count
  FROM
    shopify_orders
  WHERE
    store_id IS NOT NULL
    AND is_deleted IS NOT TRUE
  GROUP BY
    customer_id
)
SELECT
  customer_type,
  COUNT(*) AS count
FROM (
  SELECT
    CASE
      WHEN order_count = 1 THEN 'New'
      WHEN order_count > 1 THEN 'Returning'
      ELSE 'Unknown'
    END AS customer_type
  FROM
    customer_orders
) AS types
GROUP BY
  customer_type
ORDER BY
  CASE
    WHEN customer_type = 'New' THEN 1
    WHEN customer_type = 'Returning' THEN 2
    ELSE 3
  END;

-- Create or replace top countries view
CREATE OR REPLACE VIEW vw_analytics_top_countries AS
SELECT
  COALESCE(c.country, 'Unknown') AS country,
  COUNT(DISTINCT o.id) AS orders_count,
  COALESCE(SUM(o.total_price), 0) AS revenue
FROM
  shopify_orders o
LEFT JOIN
  shopify_customers c ON o.customer_id = c.id
WHERE
  o.store_id IS NOT NULL
  AND o.is_deleted IS NOT TRUE
  AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY
  COALESCE(c.country, 'Unknown')
ORDER BY
  COALESCE(SUM(o.total_price), 0) DESC
LIMIT 10; 
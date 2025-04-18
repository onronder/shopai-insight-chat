-- Drop existing views if they exist
DROP VIEW IF EXISTS vw_variant_sales;
DROP VIEW IF EXISTS vw_inventory_risks;
DROP VIEW IF EXISTS vw_return_rates;
DROP VIEW IF EXISTS vw_product_lifecycle;

-- Create variant sales view
CREATE VIEW vw_variant_sales AS
SELECT
  v.store_id,
  v.id AS variant_id,
  v.title AS variant_title,
  p.title AS product_title,
  COALESCE(SUM(li.price * li.quantity), 0) AS total_sales,
  COALESCE(SUM(li.quantity), 0) AS units_sold
FROM
  shopify_product_variants v
JOIN
  shopify_products p ON v.product_id = p.id
LEFT JOIN
  shopify_order_line_items li ON v.id = li.variant_id
LEFT JOIN
  shopify_orders o ON li.order_id = o.id AND o.is_deleted IS NOT TRUE
GROUP BY
  v.store_id, v.id, v.title, p.title
ORDER BY
  COALESCE(SUM(li.price * li.quantity), 0) DESC;

-- Create inventory risks view
CREATE VIEW vw_inventory_risks AS
WITH sales_velocity AS (
  SELECT
    v.id AS variant_id,
    v.title AS variant_title,
    p.title AS product_title,
    v.inventory_quantity AS current_inventory,
    COALESCE(SUM(li.quantity), 0) AS total_sold,
    COALESCE(SUM(li.quantity) / NULLIF(EXTRACT(EPOCH FROM (CURRENT_DATE - (CURRENT_DATE - INTERVAL '90 days'))) / 86400, 0), 0) AS daily_velocity
  FROM
    shopify_product_variants v
  JOIN
    shopify_products p ON v.product_id = p.id
  LEFT JOIN
    shopify_order_line_items li ON v.id = li.variant_id
  LEFT JOIN
    shopify_orders o ON li.order_id = o.id AND o.is_deleted IS NOT TRUE AND o.created_at >= CURRENT_DATE - INTERVAL '90 days'
  GROUP BY
    v.id, v.title, p.title, v.inventory_quantity
)
SELECT
  variant_id,
  variant_title,
  product_title,
  current_inventory,
  ROUND(daily_velocity::numeric, 2) AS sales_velocity,
  CASE
    WHEN current_inventory <= 0 AND daily_velocity > 0 THEN 'stockout'
    WHEN current_inventory <= daily_velocity * 7 AND daily_velocity > 0 THEN 'low_stock'
    WHEN current_inventory >= daily_velocity * 90 AND daily_velocity > 0 THEN 'overstock'
    ELSE 'normal'
  END AS risk_type,
  ROUND((daily_velocity * 30)::numeric, 0) AS reorder_point
FROM
  sales_velocity
WHERE
  daily_velocity > 0 OR current_inventory <= 0
ORDER BY
  CASE
    WHEN current_inventory <= 0 AND daily_velocity > 0 THEN 1
    WHEN current_inventory <= daily_velocity * 7 AND daily_velocity > 0 THEN 2
    WHEN current_inventory >= daily_velocity * 90 AND daily_velocity > 0 THEN 3
    ELSE 4
  END,
  daily_velocity DESC;

-- Create return rates view
CREATE VIEW vw_return_rates AS
SELECT
  p.id AS product_id,
  p.title AS product_title,
  COUNT(DISTINCT o.id) AS order_count,
  COUNT(DISTINCT CASE WHEN o.refunded_at IS NOT NULL THEN o.id END) AS refunded_count,
  ROUND((COUNT(DISTINCT CASE WHEN o.refunded_at IS NOT NULL THEN o.id END) * 100.0 / NULLIF(COUNT(DISTINCT o.id), 0))::numeric, 2) AS return_rate
FROM
  shopify_products p
JOIN
  shopify_product_variants v ON p.id = v.product_id
JOIN
  shopify_order_line_items li ON v.id = li.variant_id
JOIN
  shopify_orders o ON li.order_id = o.id AND o.is_deleted IS NOT TRUE
GROUP BY
  p.id, p.title
HAVING
  COUNT(DISTINCT o.id) > 5
ORDER BY
  ROUND((COUNT(DISTINCT CASE WHEN o.refunded_at IS NOT NULL THEN o.id END) * 100.0 / NULLIF(COUNT(DISTINCT o.id), 0))::numeric, 2) DESC;

-- Create product lifecycle view
CREATE VIEW vw_product_lifecycle AS
WITH product_data AS (
  SELECT
    p.id,
    p.title,
    EXTRACT(DAY FROM (CURRENT_DATE - p.created_at::date)) AS age_in_days,
    COALESCE(SUM(li.price * li.quantity), 0) AS revenue
  FROM
    shopify_products p
  LEFT JOIN
    shopify_product_variants v ON p.id = v.product_id
  LEFT JOIN
    shopify_order_line_items li ON v.id = li.variant_id
  LEFT JOIN
    shopify_orders o ON li.order_id = o.id AND o.is_deleted IS NOT TRUE
  GROUP BY
    p.id, p.title, p.created_at
),
lifecycle_categories AS (
  SELECT
    id,
    title,
    CASE
      WHEN age_in_days <= 30 THEN 'New'
      WHEN age_in_days > 30 AND revenue > 1000 THEN 'Growing'
      WHEN age_in_days > 90 AND revenue > 5000 THEN 'Mature'
      WHEN age_in_days > 180 AND revenue < 1000 THEN 'Declining'
      ELSE 'Flat'
    END AS lifecycle_stage,
    revenue
  FROM
    product_data
)
SELECT
  lifecycle_stage,
  COUNT(*) AS product_count,
  ROUND((SUM(revenue) * 100.0 / NULLIF((SELECT SUM(revenue) FROM product_data), 0))::numeric, 2) AS revenue_share
FROM
  lifecycle_categories
GROUP BY
  lifecycle_stage
ORDER BY
  CASE
    WHEN lifecycle_stage = 'New' THEN 1
    WHEN lifecycle_stage = 'Growing' THEN 2
    WHEN lifecycle_stage = 'Mature' THEN 3
    WHEN lifecycle_stage = 'Declining' THEN 4
    ELSE 5
  END; 
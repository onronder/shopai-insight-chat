-- Drop existing views if they exist
DROP VIEW IF EXISTS vw_variant_sales;
DROP VIEW IF EXISTS vw_inventory_risks;
DROP VIEW IF EXISTS vw_return_rates;
DROP VIEW IF EXISTS vw_product_lifecycle;

-- Create variant sales view
CREATE VIEW vw_variant_sales AS
SELECT
  soli.variant_id,
  pv.title AS variant_title,
  SUM(soli.price * soli.quantity) AS total_sales
FROM
  shopify_order_line_items soli
LEFT JOIN
  shopify_orders so ON soli.order_id = so.id
LEFT JOIN
  shopify_product_variants pv ON soli.variant_id = pv.id
WHERE
  so.is_deleted IS NOT TRUE
  AND so.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY
  soli.variant_id, pv.title
ORDER BY
  total_sales DESC;

-- Create inventory risks view
CREATE VIEW vw_inventory_risks AS
WITH product_sales AS (
  SELECT
    soli.product_id,
    MAX(p.title) AS product_title,
    pv.title AS variant_title,
    soli.variant_id,
    COUNT(DISTINCT so.id) AS orders_count,
    SUM(soli.quantity) AS total_quantity_sold,
    MAX(pv.inventory_quantity) AS inventory_level,
    CASE
      WHEN MAX(pv.inventory_quantity) IS NULL THEN 0
      ELSE MAX(pv.inventory_quantity)
    END AS inventory_level_safe,
    -- Calculate sales velocity (items sold per day)
    ROUND(SUM(soli.quantity)::numeric / GREATEST(90, 1), 2) AS sales_velocity
  FROM
    shopify_order_line_items soli
  JOIN
    shopify_orders so ON soli.order_id = so.id
  LEFT JOIN
    shopify_products p ON soli.product_id = p.id
  LEFT JOIN
    shopify_product_variants pv ON soli.variant_id = pv.id
  WHERE
    so.is_deleted IS NOT TRUE
    AND so.created_at >= CURRENT_DATE - INTERVAL '90 days'
  GROUP BY
    soli.product_id, pv.title, soli.variant_id
)
SELECT
  product_id,
  product_title,
  variant_title,
  CASE
    WHEN inventory_level_safe = 0 THEN 'stockout'
    WHEN inventory_level_safe < GREATEST(ROUND(sales_velocity * 14), 5) THEN 'low_stock'
    WHEN inventory_level_safe > GREATEST(ROUND(sales_velocity * 90), 20) AND sales_velocity > 0 THEN 'overstock'
    ELSE 'healthy'
  END AS risk_type,
  inventory_level_safe AS inventory_level,
  GREATEST(ROUND(sales_velocity * 14), 5) AS reorder_point,
  sales_velocity
FROM
  product_sales
WHERE
  sales_velocity > 0 OR inventory_level_safe < 5
ORDER BY
  CASE
    WHEN inventory_level_safe = 0 THEN 0 -- Stockout (highest priority)
    WHEN inventory_level_safe < GREATEST(ROUND(sales_velocity * 14), 5) THEN 1 -- Low stock
    WHEN inventory_level_safe > GREATEST(ROUND(sales_velocity * 90), 20) AND sales_velocity > 0 THEN 2 -- Overstock
    ELSE 3 -- Healthy
  END;

-- Create return rates view
CREATE VIEW vw_return_rates AS
SELECT
  p.id AS product_id,
  p.title AS product_title,
  COUNT(DISTINCT oli.order_id) AS orders_count,
  SUM(CASE WHEN o.financial_status = 'refunded' OR o.financial_status = 'partially_refunded' THEN 1 ELSE 0 END) AS returns_count,
  ROUND((SUM(CASE WHEN o.financial_status = 'refunded' OR o.financial_status = 'partially_refunded' THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(DISTINCT oli.order_id), 0)) * 100, 2) AS return_rate
FROM
  shopify_products p
JOIN
  shopify_order_line_items oli ON p.id = oli.product_id
JOIN
  shopify_orders o ON oli.order_id = o.id
WHERE
  o.is_deleted IS NOT TRUE
  AND o.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY
  p.id, p.title
HAVING
  COUNT(DISTINCT oli.order_id) >= 5 -- Only include products with at least 5 orders
ORDER BY
  return_rate DESC;

-- Create product lifecycle view
CREATE VIEW vw_product_lifecycle AS
WITH product_metrics AS (
  SELECT
    p.id,
    p.title,
    p.created_at,
    SUM(soli.price * soli.quantity) AS revenue,
    -- Days since product creation
    EXTRACT(DAY FROM CURRENT_DATE - p.created_at::date) AS product_age,
    -- Revenue in the last 30 days
    SUM(CASE WHEN so.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN soli.price * soli.quantity ELSE 0 END) AS recent_revenue,
    -- Revenue in the previous 30 days (30-60 days ago)
    SUM(CASE WHEN so.created_at BETWEEN CURRENT_DATE - INTERVAL '60 days' AND CURRENT_DATE - INTERVAL '30 days' THEN soli.price * soli.quantity ELSE 0 END) AS previous_revenue
  FROM
    shopify_products p
  LEFT JOIN
    shopify_order_line_items soli ON p.id = soli.product_id
  LEFT JOIN
    shopify_orders so ON soli.order_id = so.id AND so.is_deleted IS NOT TRUE
  WHERE
    so.created_at >= CURRENT_DATE - INTERVAL '90 days'
  GROUP BY
    p.id, p.title, p.created_at
),
lifecycle_categorized AS (
  SELECT
    id,
    title,
    revenue,
    CASE
      WHEN product_age <= 30 THEN 'New'
      WHEN recent_revenue > previous_revenue * 1.1 THEN 'Growing'
      WHEN recent_revenue < previous_revenue * 0.9 THEN 'Declining'
      WHEN recent_revenue > 0 THEN 'Mature'
      ELSE 'Flat'
    END AS lifecycle_stage
  FROM
    product_metrics
),
total_revenue AS (
  SELECT SUM(revenue) AS total FROM lifecycle_categorized
)
SELECT
  lifecycle_stage,
  COUNT(*) AS product_count,
  ROUND((SUM(revenue) / NULLIF((SELECT total FROM total_revenue), 0)) * 100, 2) AS revenue_share
FROM
  lifecycle_categorized
GROUP BY
  lifecycle_stage
ORDER BY
  revenue_share DESC; 
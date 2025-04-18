-- Fix PostgreSQL compatibility issue with Inventory Risks view
-- Maintains original risk classification logic and calculations

CREATE OR REPLACE VIEW vw_inventory_risks AS
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
    ROUND((SUM(soli.quantity)::numeric / GREATEST(90, 1)), 2) AS sales_velocity
  FROM
    shopify_order_line_items soli
  JOIN
    shopify_orders so ON soli.order_id = so.id AND so.is_deleted IS NOT TRUE
  LEFT JOIN
    shopify_products p ON soli.product_id = p.id
  LEFT JOIN
    shopify_product_variants pv ON soli.variant_id = pv.id
  WHERE
    so.created_at >= CURRENT_DATE - INTERVAL '90 days'
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
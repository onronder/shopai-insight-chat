-- Fix PostgreSQL compatibility issue with Return Rates view
-- Preserves original data structure and calculations

CREATE OR REPLACE VIEW vw_return_rates AS
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
  ROUND((SUM(CASE WHEN o.financial_status = 'refunded' OR o.financial_status = 'partially_refunded' THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(DISTINCT oli.order_id), 0)) * 100, 2) DESC; 
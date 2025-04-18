-- Fix PostgreSQL compatibility issue with Variant Sales view
-- Preserves original data structure and calculations

CREATE OR REPLACE VIEW vw_variant_sales AS
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
  SUM(soli.price * soli.quantity) DESC; 
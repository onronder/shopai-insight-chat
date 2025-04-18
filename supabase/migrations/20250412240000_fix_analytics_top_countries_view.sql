-- Fix PostgreSQL compatibility issue with Analytics Top Countries view
-- Preserves original data structure and calculations

CREATE OR REPLACE VIEW vw_analytics_top_countries AS
SELECT
  COALESCE(c.country, 'Unknown') AS country,
  COUNT(DISTINCT o.id) AS value
FROM
  shopify_orders o
LEFT JOIN
  shopify_customers c ON o.customer_id = c.id
WHERE
  o.created_at >= CURRENT_DATE - INTERVAL '90 days'
  AND o.is_deleted IS NOT TRUE
GROUP BY
  COALESCE(c.country, 'Unknown')
ORDER BY
  COUNT(DISTINCT o.id) DESC; 
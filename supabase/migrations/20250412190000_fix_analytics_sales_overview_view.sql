-- Fix PostgreSQL compatibility issue with Analytics Sales Overview view
-- Maintains original column structure and calculations

CREATE OR REPLACE VIEW vw_analytics_sales_overview AS
SELECT
  date_trunc('day', o.created_at)::date AS period,
  SUM(o.total_price) AS revenue,
  SUM(o.total_price) - COALESCE(SUM(o.total_discount), 0) AS net,
  COALESCE(SUM(o.total_discount), 0) AS refunds,
  COUNT(DISTINCT o.id) AS orders
FROM
  shopify_orders o
WHERE
  o.is_deleted IS NOT TRUE
  AND o.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY
  date_trunc('day', o.created_at)::date
ORDER BY
  date_trunc('day', o.created_at)::date; 
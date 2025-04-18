-- Fix PostgreSQL compatibility issue with Analytics Customer Types view
-- Preserves original segment logic and calculations

CREATE OR REPLACE VIEW vw_analytics_customer_types AS
WITH customer_types AS (
  SELECT
    c.id,
    CASE
      WHEN COUNT(o.id) = 0 THEN 'No Purchase'
      WHEN COUNT(o.id) = 1 THEN 'One-time'
      WHEN COUNT(o.id) BETWEEN 2 AND 3 THEN 'Repeat'
      WHEN COUNT(o.id) > 3 THEN 'Loyal'
      ELSE 'Unknown'
    END AS customer_type
  FROM
    shopify_customers c
  LEFT JOIN
    shopify_orders o ON c.id = o.customer_id AND o.is_deleted IS NOT TRUE
  GROUP BY
    c.id
)
SELECT
  customer_type AS type,
  COUNT(*) AS count
FROM
  customer_types
GROUP BY
  customer_type
ORDER BY
  COUNT(*) DESC; 
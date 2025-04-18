-- Fix PostgreSQL compatibility issue with Customer Segments view
-- Maintains original segment definitions and calculations

CREATE OR REPLACE VIEW vw_customer_segments AS
WITH customer_stats AS (
  SELECT
    c.id,
    c.email,
    COUNT(DISTINCT o.id) AS orders_count,
    COALESCE(SUM(o.total_price), 0) AS total_spent
  FROM
    shopify_customers c
  LEFT JOIN
    shopify_orders o ON c.id = o.customer_id AND o.is_deleted IS NOT TRUE
  WHERE
    c.store_id IS NOT NULL
  GROUP BY
    c.id, c.email
)
SELECT
  CASE
    WHEN total_spent >= 500 THEN 'High Value'
    WHEN total_spent >= 200 THEN 'Mid Value'
    WHEN orders_count >= 3 THEN 'Frequent'
    ELSE 'Standard'
  END AS segment,
  COUNT(*) AS customer_count,
  ROUND(AVG(total_spent / GREATEST(orders_count, 1)), 2) AS avg_order_value
FROM
  customer_stats
GROUP BY
  CASE
    WHEN total_spent >= 500 THEN 'High Value'
    WHEN total_spent >= 200 THEN 'Mid Value'
    WHEN orders_count >= 3 THEN 'Frequent'
    ELSE 'Standard'
  END
ORDER BY
  COUNT(*) DESC; 
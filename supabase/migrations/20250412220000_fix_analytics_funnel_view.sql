-- Fix PostgreSQL compatibility issue with Analytics Funnel view
-- Preserves original data structure and calculations

CREATE OR REPLACE VIEW vw_analytics_funnel AS
WITH funnel_data AS (
  SELECT
    COUNT(DISTINCT c.id) AS total_customers,
    COUNT(DISTINCT CASE WHEN o.id IS NOT NULL THEN c.id END) AS customers_with_orders,
    COUNT(DISTINCT CASE 
      WHEN customer_orders.order_count > 1 THEN c.id 
    END) AS repeat_customers
  FROM
    shopify_customers c
  LEFT JOIN
    shopify_orders o ON c.id = o.customer_id AND o.is_deleted IS NOT TRUE
  LEFT JOIN (
  SELECT
      customer_id, 
      COUNT(DISTINCT id) AS order_count
  FROM
    shopify_orders
  WHERE
    is_deleted IS NOT TRUE
  GROUP BY
      customer_id
  ) customer_orders ON c.id = customer_orders.customer_id
  WHERE
    c.created_at >= CURRENT_DATE - INTERVAL '30 days'
)
SELECT 'Customers' AS label, total_customers AS count FROM funnel_data
UNION ALL
SELECT 'Purchasers' AS label, customers_with_orders AS count FROM funnel_data
UNION ALL
SELECT 'Repeat Purchasers' AS label, repeat_customers AS count FROM funnel_data; 
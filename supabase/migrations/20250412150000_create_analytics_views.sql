-- Create sales overview view
CREATE OR REPLACE VIEW vw_analytics_sales_overview AS
SELECT
  date_trunc('day', o.created_at)::date AS period,
  SUM(o.total_price) AS revenue,
  SUM(o.total_price) - COALESCE(SUM(r.amount), 0) AS net,
  COALESCE(SUM(r.amount), 0) AS refunds,
  COUNT(DISTINCT o.id) AS orders
FROM
  shopify_orders o
LEFT JOIN
  shopify_refunds r ON o.id = r.order_id
WHERE
  o.created_at >= CURRENT_DATE - INTERVAL '90 days'
  AND o.cancelled_at IS NULL
GROUP BY
  period
ORDER BY
  period;

-- Create funnel view
CREATE OR REPLACE VIEW vw_analytics_funnel AS
WITH funnel_data AS (
  SELECT
    COUNT(DISTINCT s.id) AS total_sessions,
    COUNT(DISTINCT CASE WHEN c.id IS NOT NULL THEN c.id END) AS total_customers,
    COUNT(DISTINCT CASE WHEN o.id IS NOT NULL THEN c.id END) AS customers_with_orders,
    COUNT(DISTINCT CASE 
      WHEN customer_orders.order_count > 1 THEN c.id 
    END) AS repeat_customers
  FROM
    shopify_sessions s
  LEFT JOIN
    shopify_customers c ON s.customer_id = c.id
  LEFT JOIN
    shopify_orders o ON c.id = o.customer_id AND o.cancelled_at IS NULL
  LEFT JOIN (
    SELECT 
      customer_id, 
      COUNT(DISTINCT id) AS order_count
    FROM 
      shopify_orders
    WHERE 
      cancelled_at IS NULL
    GROUP BY 
      customer_id
  ) customer_orders ON c.id = customer_orders.customer_id
  WHERE
    s.created_at >= CURRENT_DATE - INTERVAL '30 days'
)
SELECT 'Visitors' AS label, total_sessions AS count FROM funnel_data
UNION ALL
SELECT 'Customers' AS label, total_customers AS count FROM funnel_data
UNION ALL
SELECT 'Purchasers' AS label, customers_with_orders AS count FROM funnel_data
UNION ALL
SELECT 'Repeat Purchasers' AS label, repeat_customers AS count FROM funnel_data;

-- Create customer types view
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
    shopify_orders o ON c.id = o.customer_id AND o.cancelled_at IS NULL
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
  count DESC;

-- Create top countries view
CREATE OR REPLACE VIEW vw_analytics_top_countries AS
SELECT
  COALESCE(o.shipping_address_country, 'Unknown') AS country,
  COUNT(DISTINCT o.id) AS value
FROM
  shopify_orders o
WHERE
  o.created_at >= CURRENT_DATE - INTERVAL '90 days'
  AND o.cancelled_at IS NULL
GROUP BY
  country
ORDER BY
  value DESC; 
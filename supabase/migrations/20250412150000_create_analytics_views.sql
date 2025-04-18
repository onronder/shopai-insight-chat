-- Drop existing views if they exist
DROP VIEW IF EXISTS vw_analytics_sales_overview;
DROP VIEW IF EXISTS vw_analytics_funnel;
DROP VIEW IF EXISTS vw_analytics_customer_types;
DROP VIEW IF EXISTS vw_analytics_top_countries;

-- Create sales overview view
CREATE VIEW vw_analytics_sales_overview AS
SELECT
  date_trunc('day', o.created_at)::date AS period,
  SUM(o.total_price) AS revenue,
  SUM(o.total_price) - COALESCE(SUM(o.total_discount), 0) AS net,
  COALESCE(SUM(o.total_discount), 0) AS refunds,
  COUNT(DISTINCT o.id) AS orders
FROM
  shopify_orders o
WHERE
  o.created_at >= CURRENT_DATE - INTERVAL '90 days'
  AND o.is_deleted IS NOT TRUE
GROUP BY
  period
ORDER BY
  period;

-- Create funnel view
CREATE VIEW vw_analytics_funnel AS
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

-- Create customer types view
CREATE VIEW vw_analytics_customer_types AS
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
  count DESC;

-- Create top countries view
CREATE VIEW vw_analytics_top_countries AS
SELECT
  COALESCE(g.country, 'Unknown') AS country,
  COUNT(DISTINCT o.id) AS value
FROM
  shopify_orders o
LEFT JOIN
  shopify_order_geography g ON o.id = g.order_id
WHERE
  o.created_at >= CURRENT_DATE - INTERVAL '90 days'
  AND o.is_deleted IS NOT TRUE
GROUP BY
  country
ORDER BY
  value DESC; 
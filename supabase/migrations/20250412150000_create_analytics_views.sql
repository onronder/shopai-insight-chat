-- Drop existing views if they exist
DROP VIEW IF EXISTS vw_analytics_sales_overview;
DROP VIEW IF EXISTS vw_analytics_funnel;
DROP VIEW IF EXISTS vw_analytics_customer_types;
DROP VIEW IF EXISTS vw_analytics_top_countries;

-- Create or replace view for sales overview
CREATE VIEW vw_analytics_sales_overview AS
WITH sales_data AS (
  SELECT
    DATE_TRUNC('day', o.created_at) AS day,
    DATE_TRUNC('month', o.created_at) AS month,
    SUM(o.total_price) AS revenue,
    SUM(o.total_price) - COALESCE(SUM(o.total_tax), 0) AS net,
    COALESCE(SUM(CASE WHEN o.financial_status = 'refunded' THEN o.total_price ELSE 0 END), 0) AS refunds,
    COUNT(o.id) AS orders
  FROM
    shopify_orders o
  WHERE
    o.is_deleted IS NOT TRUE
  GROUP BY
    day, month
)
SELECT
  TO_CHAR(day, 'YYYY-MM-DD') AS period,
  revenue,
  net,
  refunds,
  orders
FROM
  sales_data
ORDER BY
  day DESC;

-- Create or replace view for customer funnel
CREATE VIEW vw_analytics_funnel AS
WITH metrics AS (
  SELECT
    (SELECT COUNT(*) FROM shopify_customers) AS total_visitors,
    (SELECT COUNT(*) FROM shopify_customers WHERE email IS NOT NULL) AS subscribers,
    (SELECT COUNT(DISTINCT customer_id) FROM shopify_orders WHERE is_deleted IS NOT TRUE) AS customers,
    (SELECT COUNT(DISTINCT customer_id) FROM shopify_orders WHERE is_deleted IS NOT TRUE GROUP BY customer_id HAVING COUNT(*) > 1) AS repeat_customers
)
SELECT 'Visitors' AS label, total_visitors AS count FROM metrics
UNION ALL
SELECT 'Subscribers' AS label, subscribers AS count FROM metrics
UNION ALL
SELECT 'Customers' AS label, customers AS count FROM metrics
UNION ALL
SELECT 'Repeat Customers' AS label, repeat_customers AS count FROM metrics
ORDER BY 
  CASE 
    label 
    WHEN 'Visitors' THEN 1 
    WHEN 'Subscribers' THEN 2 
    WHEN 'Customers' THEN 3 
    WHEN 'Repeat Customers' THEN 4 
    ELSE 5 
  END;

-- Create or replace view for customer types
CREATE VIEW vw_analytics_customer_types AS
WITH order_counts AS (
  SELECT
    c.id,
    COUNT(o.id) AS order_count
  FROM
    shopify_customers c
  LEFT JOIN
    shopify_orders o ON c.id = o.customer_id AND o.is_deleted IS NOT TRUE
  GROUP BY
    c.id
),
customer_types AS (
  SELECT
    CASE
      WHEN order_count = 0 THEN 'No Orders'
      WHEN order_count = 1 THEN 'One-time'
      WHEN order_count BETWEEN 2 AND 3 THEN 'Occasional'
      WHEN order_count > 3 THEN 'Loyal'
    END AS type,
    COUNT(*) AS count
  FROM
    order_counts
  GROUP BY
    type
)
SELECT
  type,
  count
FROM
  customer_types
ORDER BY
  CASE 
    type
    WHEN 'No Orders' THEN 1
    WHEN 'One-time' THEN 2
    WHEN 'Occasional' THEN 3
    WHEN 'Loyal' THEN 4
    ELSE 5
  END;

-- Create or replace view for top countries
CREATE VIEW vw_analytics_top_countries AS
WITH country_orders AS (
  SELECT
    COALESCE(shipping_address->>'country', 'Unknown') AS country,
    COUNT(*) AS value
  FROM
    shopify_orders
  WHERE
    is_deleted IS NOT TRUE
  GROUP BY
    country
)
SELECT
  country,
  value
FROM
  country_orders
ORDER BY
  value DESC
LIMIT 10; 
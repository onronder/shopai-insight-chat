-- Drop existing views if they exist
DROP VIEW IF EXISTS vw_customer_segments;
DROP VIEW IF EXISTS vw_ltv_distribution;
DROP VIEW IF EXISTS vw_churn_candidates;
DROP VIEW IF EXISTS vw_repeat_customers;

-- Create customer segment view
CREATE VIEW vw_customer_segments AS
SELECT
  CASE
    WHEN total_spent >= 500 THEN 'High Value'
    WHEN total_spent >= 200 THEN 'Mid Value'
    WHEN orders_count >= 3 THEN 'Frequent'
    ELSE 'Standard'
  END AS segment,
  COUNT(*) AS customer_count,
  ROUND(AVG(total_spent / GREATEST(orders_count, 1)), 2) AS avg_order_value
FROM (
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
) customer_stats
GROUP BY
  segment
ORDER BY
  customer_count DESC;

-- Create LTV distribution view
CREATE VIEW vw_ltv_distribution AS
SELECT
  CASE
    WHEN total_spent >= 1000 THEN '$1000+'
    WHEN total_spent >= 500 THEN '$500-999'
    WHEN total_spent >= 250 THEN '$250-499'
    WHEN total_spent >= 100 THEN '$100-249'
    WHEN total_spent > 0 THEN '$1-99'
    ELSE '$0'
  END AS bucket,
  COUNT(*) AS count
FROM (
  SELECT
    c.id,
    COALESCE(SUM(o.total_price), 0) AS total_spent
  FROM
    shopify_customers c
  LEFT JOIN
    shopify_orders o ON c.id = o.customer_id AND o.is_deleted IS NOT TRUE
  WHERE
    c.store_id IS NOT NULL
  GROUP BY
    c.id
) customer_ltv
GROUP BY
  bucket
ORDER BY
  CASE
    WHEN bucket = '$1000+' THEN 6
    WHEN bucket = '$500-999' THEN 5
    WHEN bucket = '$250-499' THEN 4
    WHEN bucket = '$100-249' THEN 3
    WHEN bucket = '$1-99' THEN 2
    ELSE 1
  END;

-- Create churn candidates view
CREATE VIEW vw_churn_candidates AS
SELECT
  c.id,
  c.email,
  EXTRACT(DAY FROM (CURRENT_DATE - MAX(o.created_at)::date)) AS days_inactive
FROM
  shopify_customers c
LEFT JOIN
  shopify_orders o ON c.id = o.customer_id AND o.is_deleted IS NOT TRUE
WHERE
  c.store_id IS NOT NULL
  AND c.id IN (
    SELECT customer_id FROM shopify_orders 
    WHERE is_deleted IS NOT TRUE
    GROUP BY customer_id 
    HAVING COUNT(*) >= 1
  )
GROUP BY
  c.id, c.email
HAVING
  MAX(o.created_at) < (CURRENT_DATE - INTERVAL '30 days')
ORDER BY
  days_inactive DESC;

-- Create repeat customers view
CREATE VIEW vw_repeat_customers AS
SELECT
  COUNT(CASE WHEN orders_count > 1 THEN 1 END) AS repeat_customers,
  COUNT(CASE WHEN orders_count = 1 THEN 1 END) AS new_customers
FROM (
  SELECT
    c.id,
    COUNT(DISTINCT o.id) AS orders_count
  FROM
    shopify_customers c
  LEFT JOIN
    shopify_orders o ON c.id = o.customer_id AND o.is_deleted IS NOT TRUE
  WHERE
    c.store_id IS NOT NULL
  GROUP BY
    c.id
) customer_orders; 
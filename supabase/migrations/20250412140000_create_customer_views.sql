-- Drop existing views if they exist
DROP VIEW IF EXISTS vw_customer_segments;
DROP VIEW IF EXISTS vw_ltv_distribution;
DROP VIEW IF EXISTS vw_churn_candidates;
DROP VIEW IF EXISTS vw_repeat_customers;

-- Create customer segments view
CREATE VIEW vw_customer_segments AS
SELECT
  segment,
  COUNT(*) AS count,
  ROUND(AVG(order_count)) AS avg_orders,
  ROUND(AVG(total_spent)::numeric, 2) AS avg_spent
FROM (
  SELECT
    c.id,
    COUNT(o.id) AS order_count,
    COALESCE(SUM(o.total_price), 0) AS total_spent,
    CASE
      WHEN COUNT(o.id) >= 3 AND COALESCE(SUM(o.total_price), 0) >= 500 THEN 'VIP'
      WHEN COUNT(o.id) >= 3 THEN 'Loyal'
      WHEN COALESCE(SUM(o.total_price), 0) >= 500 THEN 'Big Spender'
      WHEN COUNT(o.id) = 0 THEN 'Inactive'
      ELSE 'Regular'
    END AS segment
  FROM
    shopify_customers c
  LEFT JOIN
    shopify_orders o ON c.id = o.customer_id AND o.is_deleted IS NOT TRUE
  WHERE
    c.store_id IS NOT NULL
  GROUP BY
    c.id
) segments
GROUP BY
  segment
ORDER BY
  avg_spent DESC;

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
  CASE
    WHEN total_spent >= 1000 THEN '$1000+'
    WHEN total_spent >= 500 THEN '$500-999'
    WHEN total_spent >= 250 THEN '$250-499'
    WHEN total_spent >= 100 THEN '$100-249'
    WHEN total_spent > 0 THEN '$1-99'
    ELSE '$0'
  END
ORDER BY
  CASE
    WHEN CASE
      WHEN total_spent >= 1000 THEN '$1000+'
      WHEN total_spent >= 500 THEN '$500-999'
      WHEN total_spent >= 250 THEN '$250-499'
      WHEN total_spent >= 100 THEN '$100-249'
      WHEN total_spent > 0 THEN '$1-99'
      ELSE '$0'
    END = '$1000+' THEN 6
    WHEN CASE
      WHEN total_spent >= 1000 THEN '$1000+'
      WHEN total_spent >= 500 THEN '$500-999'
      WHEN total_spent >= 250 THEN '$250-499'
      WHEN total_spent >= 100 THEN '$100-249'
      WHEN total_spent > 0 THEN '$1-99'
      ELSE '$0'
    END = '$500-999' THEN 5
    WHEN CASE
      WHEN total_spent >= 1000 THEN '$1000+'
      WHEN total_spent >= 500 THEN '$500-999'
      WHEN total_spent >= 250 THEN '$250-499'
      WHEN total_spent >= 100 THEN '$100-249'
      WHEN total_spent > 0 THEN '$1-99'
      ELSE '$0'
    END = '$250-499' THEN 4
    WHEN CASE
      WHEN total_spent >= 1000 THEN '$1000+'
      WHEN total_spent >= 500 THEN '$500-999'
      WHEN total_spent >= 250 THEN '$250-499'
      WHEN total_spent >= 100 THEN '$100-249'
      WHEN total_spent > 0 THEN '$1-99'
      ELSE '$0'
    END = '$100-249' THEN 3
    WHEN CASE
      WHEN total_spent >= 1000 THEN '$1000+'
      WHEN total_spent >= 500 THEN '$500-999'
      WHEN total_spent >= 250 THEN '$250-499'
      WHEN total_spent >= 100 THEN '$100-249'
      WHEN total_spent > 0 THEN '$1-99'
      ELSE '$0'
    END = '$1-99' THEN 2
    ELSE 1
  END DESC;

-- Create churn candidates view
CREATE VIEW vw_churn_candidates AS
SELECT
  c.id,
  c.first_name,
  c.last_name,
  c.email,
  MAX(o.created_at) AS last_order_date,
  COUNT(o.id) AS order_count,
  COALESCE(SUM(o.total_price), 0) AS total_spent,
  EXTRACT(DAY FROM (CURRENT_TIMESTAMP - MAX(o.created_at))) AS days_since_last_order
FROM
  shopify_customers c
JOIN
  shopify_orders o ON c.id = o.customer_id AND o.is_deleted IS NOT TRUE
WHERE
  c.store_id IS NOT NULL
GROUP BY
  c.id, c.first_name, c.last_name, c.email
HAVING
  COUNT(o.id) > 1
  AND EXTRACT(DAY FROM (CURRENT_TIMESTAMP - MAX(o.created_at))) > 90
ORDER BY
  days_since_last_order DESC;

-- Create repeat customers view
CREATE VIEW vw_repeat_customers AS
SELECT
  c.id,
  c.first_name,
  c.last_name,
  c.email,
  MIN(o.created_at) AS first_order_date,
  MAX(o.created_at) AS last_order_date,
  COUNT(o.id) AS order_count,
  COALESCE(SUM(o.total_price), 0) AS total_spent,
  ROUND(COALESCE(SUM(o.total_price), 0) / COUNT(o.id), 2) AS average_order_value
FROM
  shopify_customers c
JOIN
  shopify_orders o ON c.id = o.customer_id AND o.is_deleted IS NOT TRUE
WHERE
  c.store_id IS NOT NULL
GROUP BY
  c.id, c.first_name, c.last_name, c.email
HAVING
  COUNT(o.id) > 1
ORDER BY
  order_count DESC, total_spent DESC; 
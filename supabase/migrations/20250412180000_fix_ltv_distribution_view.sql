-- Fix PostgreSQL compatibility issue with LTV distribution view
-- Only addresses the ORDER BY bucket alias reference issue
-- Preserves all business logic and bucket definitions

CREATE OR REPLACE VIEW vw_ltv_distribution AS
WITH customer_ltv AS (
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
)
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
FROM
  customer_ltv
GROUP BY 1
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
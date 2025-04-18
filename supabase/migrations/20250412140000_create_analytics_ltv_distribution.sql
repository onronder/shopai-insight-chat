-- Create store-specific percentile LTV view 
CREATE OR REPLACE VIEW public.analytics_ltv_distribution AS
WITH customer_totals AS (
  SELECT
    o.store_id,
    o.customer_id,
    SUM(o.total_price) AS ltv
  FROM shopify_orders o
  WHERE o.is_deleted IS NOT TRUE
    AND o.customer_id IS NOT NULL
  GROUP BY o.store_id, o.customer_id
),
ranked_customers AS (
  SELECT
    store_id,
    customer_id,
    ltv,
    NTILE(100) OVER (PARTITION BY store_id ORDER BY ltv) AS percentile
  FROM customer_totals
),
bucketed AS (
  SELECT
    store_id,
    CASE
      WHEN percentile <= 25 THEN 'Low (0-25%)'
      WHEN percentile <= 75 THEN 'Medium (25-75%)'
      ELSE 'High (75-100%)'
    END AS bucket
  FROM ranked_customers
)
SELECT
  store_id,
  bucket,
  COUNT(*) AS count
FROM bucketed
GROUP BY store_id, bucket
ORDER BY store_id, 
  CASE
    WHEN bucket = 'Low (0-25%)' THEN 1
    WHEN bucket = 'Medium (25-75%)' THEN 2
    ELSE 3
  END; 
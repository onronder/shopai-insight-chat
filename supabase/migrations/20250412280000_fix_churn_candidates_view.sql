-- Fix PostgreSQL compatibility issue with Churn Candidates view
-- Preserves original data structure and churn criteria

CREATE OR REPLACE VIEW vw_churn_candidates AS
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
  EXTRACT(DAY FROM (CURRENT_DATE - MAX(o.created_at)::date)) DESC; 
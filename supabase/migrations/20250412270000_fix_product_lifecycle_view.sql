-- Fix PostgreSQL compatibility issue with Product Lifecycle view
-- Preserves original data structure and calculations

CREATE OR REPLACE VIEW vw_product_lifecycle AS
WITH product_metrics AS (
  SELECT
    p.id,
    p.title,
    p.created_at,
    SUM(soli.price * soli.quantity) AS revenue,
    -- Days since product creation
    EXTRACT(DAY FROM CURRENT_DATE - p.created_at::date) AS product_age,
    -- Revenue in the last 30 days
    SUM(CASE WHEN so.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN soli.price * soli.quantity ELSE 0 END) AS recent_revenue,
    -- Revenue in the previous 30 days (30-60 days ago)
    SUM(CASE WHEN so.created_at BETWEEN CURRENT_DATE - INTERVAL '60 days' AND CURRENT_DATE - INTERVAL '30 days' THEN soli.price * soli.quantity ELSE 0 END) AS previous_revenue
  FROM
    shopify_products p
  LEFT JOIN
    shopify_order_line_items soli ON p.id = soli.product_id
  LEFT JOIN
    shopify_orders so ON soli.order_id = so.id AND so.is_deleted IS NOT TRUE
  WHERE
    so.created_at >= CURRENT_DATE - INTERVAL '90 days'
  GROUP BY
    p.id, p.title, p.created_at
),
lifecycle_categorized AS (
  SELECT
    id,
    title,
    revenue,
    CASE
      WHEN product_age <= 30 THEN 'New'
      WHEN recent_revenue > previous_revenue * 1.1 THEN 'Growing'
      WHEN recent_revenue < previous_revenue * 0.9 THEN 'Declining'
      WHEN recent_revenue > 0 THEN 'Mature'
      ELSE 'Flat'
    END AS lifecycle_stage
  FROM
    product_metrics
),
total_revenue AS (
  SELECT SUM(revenue) AS total FROM lifecycle_categorized
)
SELECT
  lifecycle_stage,
  COUNT(*) AS product_count,
  ROUND((SUM(revenue) / NULLIF((SELECT total FROM total_revenue), 0)) * 100, 2) AS revenue_share
FROM
  lifecycle_categorized
GROUP BY
  lifecycle_stage
ORDER BY
  CASE
    WHEN lifecycle_stage = 'New' THEN 1
    WHEN lifecycle_stage = 'Growing' THEN 2
    WHEN lifecycle_stage = 'Mature' THEN 3
    WHEN lifecycle_stage = 'Declining' THEN 4
    ELSE 5
  END; 
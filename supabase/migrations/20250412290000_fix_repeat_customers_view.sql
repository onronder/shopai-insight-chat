-- Fix PostgreSQL compatibility issue with Repeat Customers view
-- Preserves original data structure and repeat customer definition

CREATE OR REPLACE VIEW vw_repeat_customers AS
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
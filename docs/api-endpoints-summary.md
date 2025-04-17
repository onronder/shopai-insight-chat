# API Endpoints Summary

## Overview

This document provides a complete list of API endpoints required for the dashboard and insights pages of the application. All endpoints follow a consistent pattern, connecting to Supabase database views that provide the necessary data.

## Required Database Views

| View Name | Purpose | Used By |
|-----------|---------|---------|
| `vw_analytics_sales_overview` | Time series of sales metrics | Sales Overview Chart |
| `vw_analytics_funnel` | Customer funnel stages | Funnel Overview Chart |
| `vw_analytics_customer_types` | Customer segmentation | Customer Types Chart |
| `vw_analytics_top_countries` | Geographical distribution of sales | Top Countries Chart |
| `vw_customer_segments` | Customer segments with counts and AOV | Customer Segments Table |
| `vw_ltv_distribution` | Customer LTV distribution in buckets | LTV Distribution Chart |
| `vw_churn_candidates` | Customers at risk of churning | Churn Forecast Chart |
| `vw_repeat_customers` | Ratio of repeat vs. new customers | Best Customers Component |
| `vw_sales_over_time` | Order volume over time | Order Volume Chart |
| `vw_order_statuses` | Order counts by status | Order Status Chart |
| `vw_fulfillment_delays` | Order fulfillment delays | Fulfillment Delays Chart |
| `vw_avg_order_value` | Average order value | Average Order Value Chart |
| `vw_discounted_orders` | Orders with discounts applied | Discounted Orders List |
| `vw_variant_sales` | Sales by product variant | Variant Sales Chart |
| `vw_inventory_risks` | Products with inventory risks | Inventory Risk Table |
| `vw_return_rates` | Product return rates | Return Rate Chart |
| `vw_product_lifecycle` | Products by lifecycle stage | Product Lifecycle Chart |
| `vw_store_health_summary` | Store health metrics | Store Health Index Card |
| `vw_webhook_success_rate` | Webhook delivery success rates | Webhook Health Component |
| `vw_function_usage_summary` | Function success rates | Function Reliability Component |

## API Endpoints

### Analytics Page Endpoints

1. `/functions/v1/analytics_sales_overview`
   - **Required View**: `vw_analytics_sales_overview`
   - **Data Format**: `{ period: string, revenue: number, net: number, refunds: number, orders: number }[]`

2. `/functions/v1/analytics_funnel`
   - **Required View**: `vw_analytics_funnel`
   - **Data Format**: `{ label: string, count: number }[]`

3. `/functions/v1/analytics_customer_types`
   - **Required View**: `vw_analytics_customer_types`
   - **Data Format**: `{ type: string, count: number }[]`

4. `/functions/v1/analytics_top_countries`
   - **Required View**: `vw_analytics_top_countries`
   - **Data Format**: `{ country: string, value: number }[]`

### Customers Page Endpoints

5. `/functions/v1/metrics_customer_segments`
   - **Required View**: `vw_customer_segments`
   - **Data Format**: `{ segment: string, customer_count: number, avg_order_value: number }[]`

6. `/functions/v1/metrics_ltv_distribution`
   - **Required View**: `vw_ltv_distribution`
   - **Data Format**: `{ bucket: string, count: number }[]`

7. `/functions/v1/metrics_churn_candidates`
   - **Required View**: `vw_churn_candidates`
   - **Data Format**: `{ id: string, email: string, days_inactive: number }[]`

8. `/functions/v1/metrics_repeat_ratio`
   - **Required View**: `vw_repeat_customers`
   - **Data Format**: `{ repeat_customers: number, new_customers: number }`

### Orders Page Endpoints

9. `/functions/v1/metrics_sales_over_time`
   - **Required View**: `vw_sales_over_time`
   - **Data Format**: `{ name: string, sales: number }[]`

10. `/functions/v1/metrics_order_statuses`
    - **Required View**: `vw_order_statuses`
    - **Data Format**: `{ status: string, count: number }[]`

11. `/functions/v1/metrics_fulfillment_delays`
    - **Required View**: `vw_fulfillment_delays`
    - **Data Format**: `{ order_id: string, delay_days: number }[]`

12. `/rest/v1/vw_avg_order_value`
    - **Required View**: `vw_avg_order_value`
    - **Data Format**: `{ value: number, currency: string }`

13. `/rest/v1/vw_discounted_orders`
    - **Required View**: `vw_discounted_orders`
    - **Data Format**: `{ order_id: string, discount: number, customer: string, total: number }[]`

### Products Page Endpoints

14. `/functions/v1/metrics_variant_sales`
    - **Required View**: `vw_variant_sales`
    - **Data Format**: `{ variant_title: string, total_sales: number }[]`

15. `/functions/v1/metrics_inventory_risks`
    - **Required View**: `vw_inventory_risks`
    - **Data Format**: `{ product_id: string, product_title: string, variant_title: string, risk_type: string, inventory_level: number, reorder_point?: number, sales_velocity?: number }[]`

16. `/functions/v1/metrics_return_rates`
    - **Required View**: `vw_return_rates`
    - **Data Format**: `{ product_id: string, product_title: string, orders_count: number, returns_count: number, return_rate: number }[]`

17. `/functions/v1/metrics_product_lifecycle`
    - **Required View**: `vw_product_lifecycle`
    - **Data Format**: `{ lifecycle_stage: string, product_count: number, revenue_share: number }[]`

### Store Page Endpoints

18. `/rest/v1/vw_store_health_summary`
    - **Required View**: `vw_store_health_summary`
    - **Data Format**: `{ hours_since_last_sync: number, recent_errors: number }[]`

19. `/rest/v1/vw_webhook_success_rate`
    - **Required View**: `vw_webhook_success_rate`
    - **Data Format**: `{ type: string, success_rate: number }[]`

20. `/rest/v1/vw_function_usage_summary`
    - **Required View**: `vw_function_usage_summary`
    - **Data Format**: `{ function_name: string, success_rate: number }[]`

## Implementation Notes

1. All API endpoints include proper error handling
2. CORS headers are set for cross-domain access
3. Query parameters are supported for time period filtering where applicable
4. Database views should include appropriate indexes for performance
5. Authentication is enforced through Supabase JWT tokens 
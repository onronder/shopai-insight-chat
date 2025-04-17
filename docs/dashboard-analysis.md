# Dashboard Page Analysis

## Overview
The Dashboard page is the main landing page after login, displaying key metrics and data visualizations about the store's performance. It includes statistics cards, sales charts, product performance, customer acquisition trends, and a recent activity feed.

## Component Requirements

### 1. DashboardStatsCards
- **Purpose**: Displays summary statistics with trend indicators
- **Props**:
  - `data?: StatData[]` - Array of statistics with trends
- **Expected Data Structure**:
  ```typescript
  interface StatData {
    title: string;    // Statistic name
    value: string;    // Current value (formatted)
    change: string;   // Change amount (formatted)
    trend: 'up' | 'down';  // Direction of change
    icon: typeof DollarSign | typeof Users | typeof ShoppingCart | typeof TrendingUp;  // Icon component
  }
  ```
- **Validation**: Component safely handles empty data with `data = []` default and null check

### 2. SalesOverTimeChart
- **Purpose**: Line chart showing sales trends over time
- **Props**:
  - `data?: SalesData[]` - Array of time-series data points
- **Expected Data Structure**:
  ```typescript
  interface SalesData {
    name: string;    // Time period (e.g., date)
    sales: number;   // Sales amount
    target: number;  // Target amount (not currently used in chart)
  }
  ```
- **Validation**: Component safely handles empty data

### 3. TopProductsChart
- **Purpose**: Bar chart showing top-selling products
- **Props**:
  - `data?: ProductData[]` - Array of product performance data
- **Expected Data Structure**:
  ```typescript
  interface ProductData {
    name: string;   // Product name
    value: number;  // Sales amount or quantity
  }
  ```
- **Validation**: Component safely handles empty data

### 4. CustomerAcquisitionChart
- **Purpose**: Line chart showing new customer acquisition over time
- **Props**:
  - `data?: AcquisitionData[]` - Array of customer acquisition data points
- **Expected Data Structure**:
  ```typescript
  interface AcquisitionData {
    period: string;        // Time period (e.g., month)
    new_customers: number; // Count of new customers
  }
  ```
- **Validation**: Component safely handles empty data

### 5. ActivityFeed
- **Purpose**: Timeline of recent store activities
- **Props**:
  - `data?: ActivityData[]` - Array of activity events
- **Expected Data Structure**:
  ```typescript
  interface ActivityData {
    id: number;      // Activity ID
    action: string;  // Activity description
    details: string; // Additional details
    time: string;    // Formatted timestamp
  }
  ```
- **Validation**: Component safely handles empty data

## Hook Analysis: useDashboardData

The `useDashboardData` hook fetches data from multiple endpoints and aggregates it for the dashboard components.

### Implementation:
```typescript
export const useDashboardData = () => {
  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<StatData[]>({
    queryKey: ['dashboard_summary'],
    queryFn: () => fetcher('/functions/v1/metrics_dashboard_summary'),
  });

  // Fetch sales time-series data
  const { data: sales, isLoading: salesLoading, error: salesError } = useQuery<SalesData[]>({
    queryKey: ['sales_over_time'],
    queryFn: () => fetcher('/functions/v1/metrics_sales_over_time'),
  });

  // Fetch top products data
  const { data: products, isLoading: topProductsLoading, error: topProductsError } = useQuery<ProductData[]>({
    queryKey: ['top_products'],
    queryFn: () => fetcher('/functions/v1/metrics_top_products'),
  });

  // Fetch customer acquisition data
  const { data: acquisition, isLoading: acquisitionLoading, error: acquisitionError } = useQuery<AcquisitionData[]>({
    queryKey: ['customer_acquisition'],
    queryFn: () => fetcher('/functions/v1/metrics_customer_acquisition'),
  });

  // Fetch activity feed data
  const { data: activity, isLoading: feedLoading, error: feedError } = useQuery<ActivityData[]>({
    queryKey: ['activity_feed'],
    queryFn: () => fetcher('/functions/v1/metrics_activity_feed'),
  });

  // Aggregate results
  return {
    stats,
    sales,
    products,
    acquisition,
    activity,
    isLoading: statsLoading || salesLoading || topProductsLoading || acquisitionLoading || feedLoading,
    error: statsError || salesError || topProductsError || acquisitionError || feedError,
  };
};
```

### Issues and Concerns:
1. **Type Mismatch**: The edge functions may not return data in exactly the format expected by the interfaces
2. **Error Handling**: The hook combines all errors, making it difficult to determine which request failed
3. **Data Transformation**: No transformation logic to reshape API responses to match component requirements
4. **Authentication**: Uses a helper to add auth headers but doesn't handle token expiration or refresh

## Edge Function Analysis

### 1. metrics_dashboard_summary
- **Purpose**: Fetches summary statistics for the dashboard cards
- **Database Source**: `view_dashboard_summary` view
- **Security**:
  - ✅ Uses JWT verification
  - ✅ Implements rate limiting
  - ✅ Adds security headers
  - ✅ Properly validates store_id
- **Response Format**: Does not match the expected `StatData[]` format directly
- **Edge Cases**:
  - No transformation of database values to UI-friendly formats
  - Missing trend calculation logic which is required for UI

### 2. metrics_sales_over_time
- **Purpose**: Fetches time-series sales data
- **Database Source**: `view_sales_over_time` view
- **Security**: Likely similar to dashboard_summary (needs verification)
- **Edge Cases**: Missing target values required by the interface

### 3. metrics_top_products
- **Purpose**: Fetches top-selling products
- **Database Source**: `view_top_products` view
- **Concerns**: Needs to map database fields to the expected format

### 4. metrics_customer_acquisition
- **Purpose**: Fetches customer acquisition data
- **Database Source**: `vw_customer_acquisition` view
- **Concerns**: Needs to map the period field correctly for UI display

### 5. metrics_activity_feed
- **Purpose**: Fetches recent activity events
- **Database Source**: Unclear which view is used (needs investigation)
- **Concerns**: May need to transform timestamps into user-friendly formats

## Database View Analysis

### view_dashboard_summary
```sql
CREATE VIEW public.view_dashboard_summary AS
SELECT o.store_id,
       SUM(o.total_price) AS total_revenue,
       COUNT(o.id) AS total_orders,
       ROUND(AVG(o.total_price), 2) AS avg_order_value,
       (SELECT COUNT(*) AS count
        FROM (SELECT shopify_orders.customer_id,
                     MIN(shopify_orders.created_at) AS first_order_date
              FROM shopify_orders
              WHERE shopify_orders.customer_id IS NOT NULL
              GROUP BY shopify_orders.customer_id
              HAVING MIN(shopify_orders.created_at) >= (NOW() - '30 days'::interval)) new_cust
         WHERE (new_cust.customer_id IN (SELECT shopify_customers.id
                                          FROM shopify_customers
                                          WHERE shopify_customers.store_id = o.store_id))) AS new_customers,
       'last_30_days'::text AS date_range
FROM shopify_orders o
WHERE o.created_at >= (NOW() - '30 days'::interval)
GROUP BY o.store_id;
```

**Issues**:
1. Missing prior period comparison for trend calculation
2. No user-friendly formatting of values
3. Does not directly match the `StatData` interface structure

### view_sales_over_time
```sql
CREATE VIEW public.view_sales_over_time AS
SELECT o.store_id,
       DATE_TRUNC('day', o.created_at) AS day,
       SUM(o.total_price) AS daily_revenue,
       COUNT(o.id) AS daily_orders
FROM shopify_orders o
WHERE o.created_at >= (NOW() - '30 days'::interval)
GROUP BY o.store_id, DATE_TRUNC('day', o.created_at)
ORDER BY DATE_TRUNC('day', o.created_at);
```

**Issues**:
1. Returns `day`, `daily_revenue`, and `daily_orders`, but the interface expects `name` and `sales`
2. Missing `target` values which are required by the interface

### view_top_products
```sql
CREATE VIEW public.view_top_products AS
SELECT li.store_id,
       p.title AS product_title,
       SUM(li.quantity) AS units_sold,
       SUM(li.price * li.quantity::numeric) AS total_revenue,
       ROUND(SUM(li.price * li.quantity::numeric) * 100.0 / NULLIF(SUM(SUM(li.price * li.quantity::numeric)) OVER (PARTITION BY li.store_id), 0::numeric), 2) AS percentage_of_total
FROM shopify_order_line_items li
JOIN shopify_products p ON p.id = li.product_id
WHERE li.created_at >= (NOW() - '30 days'::interval)
GROUP BY li.store_id, p.title
ORDER BY SUM(li.price * li.quantity::numeric) DESC
LIMIT 10;
```

**Issues**:
1. Returns different field names than what the interface expects
2. May need to choose between total_revenue and units_sold for the value field

### vw_customer_acquisition
```sql
CREATE VIEW public.vw_customer_acquisition AS
SELECT vw_customer_acquisition_raw.store_id,
       vw_customer_acquisition_raw.period,
       COUNT(*) AS new_customers
FROM vw_customer_acquisition_raw
GROUP BY vw_customer_acquisition_raw.store_id, vw_customer_acquisition_raw.period
ORDER BY vw_customer_acquisition_raw.period;
```

**Issues**:
1. Field names match the interface, but format of period may need transformation

## Security Analysis

### Authentication
- ✅ Uses JWT token verification
- ⚠️ No clear token refresh mechanism
- ✅ Falls back to custom JWT if session auth fails

### Authorization
- ✅ Row-level security on database tables
- ✅ Store ID verification to ensure data isolation

### Rate Limiting
- ✅ Implemented per client IP and store ID
- ✅ Proper headers returned for rate limit status

### Headers and Content Security
- ✅ Security headers added to responses
- ✅ Content-Type properly set
- ⚠️ No CORS configuration visible in the code samples

## Refactoring Needs

### 1. Data Transformation Layer
- Add transformation functions in the hook to map database fields to component interface fields
- Include formatting for user-friendly display (currencies, percentages, dates)
- Calculate trends by comparing current and previous periods

### 2. Edge Function Enhancements
- Consolidate multiple API calls into fewer requests where possible
- Add proper error handling with specific error codes and messages
- Include trend calculations in database views or edge functions

### 3. Type Safety Improvements
- Create strict TypeScript interfaces for the API responses
- Add runtime validation of API responses
- Ensure proper null/undefined handling

### 4. Security Enhancements
- Add token refresh mechanism
- Implement consistent error handling for auth failures
- Add CORS configuration if needed

### 5. Performance Optimization
- Use query batching for multiple requests
- Implement stale-while-revalidate caching
- Consider server-side data aggregation to reduce client-side processing

## Implementation Plan

1. **Update Database Views**
   - Add previous period comparison to view_dashboard_summary
   - Standardize naming conventions across views

2. **Update Edge Functions**
   - Add data transformation to match component interfaces
   - Improve error handling and logging
   - Add caching headers for better performance

3. **Enhance useDashboardData Hook**
   - Add transformation functions for each data type
   - Implement better error handling and reporting
   - Add loading states for individual data segments

4. **Update Components (if needed)**
   - Ensure all components handle loading, error, and empty states gracefully

5. **Testing**
   - Add comprehensive testing for the data flow
   - Verify security mechanisms
   - Test performance with realistic data volumes

## Completed Tasks

### Database Updates
- ✅ Created `view_dashboard_summary_with_trends` with period comparison for trend calculation
- ✅ Created `view_sales_over_time_with_targets` with target values for charts
- ✅ Created optimized views for all remaining dashboard metrics

### Edge Function Updates
- ✅ Updated `metrics_dashboard_summary` to transform database data to match UI component requirements
- ✅ Updated `metrics_sales_over_time` to use the new view with targets
- ✅ Updated `metrics_top_products` to properly transform product data for the TopProductsChart
- ✅ Added new edge functions for all dashboard metrics with proper error handling and type safety
- ✅ Implemented rate limiting and security headers on all edge functions

### Hook Updates
- ✅ Enhanced `useDashboardData` hook with:
  - Improved error handling
  - Type safety for API responses
  - Icon name to component transformation
  - Caching strategy (5-minute stale time)
  - Proper null handling with fallback empty arrays 
  - Added data transformations to match component requirements
  - Consolidated error states for better UX 
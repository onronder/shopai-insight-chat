# Analytics Page Analysis

## Page Overview

The Analytics page provides in-depth sales and customer analysis through four main views:
- Sales Overview (line chart)
- Funnel Analysis (bar chart)
- Customer Types (pie chart)
- Top Countries (bar chart)

## Components Structure

1. **TabsList Navigation**
   - Four tabs for different analytics views
   - Seamless switching between views

2. **Sales Overview Chart**
   - Line chart showing revenue trends
   - Three metrics tracked: Total Revenue, Net Revenue, Refunds
   - Time-based x-axis

3. **Funnel Overview Chart**
   - Bar chart showing conversion funnel
   - Shows steps from visitors → prospects → customers → repeat customers
   - Visualizes drop-offs between stages

4. **Customer Types Chart**
   - Pie chart showing customer segmentation
   - Categories might include: one-time, repeat, VIP, at-risk, etc.
   - Proportional visualization of customer types

5. **Top Countries Chart**
   - Bar chart showing geographical distribution
   - Shows order volume or revenue by country
   - Helps identify key markets

## Data Requirements

### SalesOverviewPoint Interface
```typescript
export interface SalesOverviewPoint {
  period: string
  revenue: number
  net: number
  refunds: number
  orders: number
}
```

### FunnelStep Interface
```typescript
export interface FunnelStep {
  label: string
  count: number
}
```

### CustomerTypeBreakdown Interface
```typescript
export interface CustomerTypeBreakdown {
  type: string
  count: number
}
```

### CountryData Interface
```typescript
export interface CountryData {
  country: string
  value: number
}
```

## API Endpoints Needed

1. `/functions/v1/analytics_sales_overview`
   - Returns array of SalesOverviewPoint objects
   - Time series data with period, revenue metrics
   - Powers the Sales Overview line chart

2. `/functions/v1/analytics_funnel`
   - Returns array of FunnelStep objects
   - Shows conversion stages and drop-offs
   - Powers the Funnel Overview bar chart

3. `/functions/v1/analytics_customer_types`
   - Returns array of CustomerTypeBreakdown objects
   - Customer segmentation data
   - Powers the Customer Types pie chart

4. `/functions/v1/analytics_top_countries`
   - Returns array of CountryData objects
   - Geographic distribution data
   - Powers the Top Countries bar chart

## Database Views/Tables Needed

1. `vw_analytics_sales_overview`
   - Aggregates order data by period
   - Calculates total revenue, net, refunds

2. `vw_analytics_funnel`
   - Analyzes customer journey stages
   - Counts users at each stage

3. `vw_analytics_customer_types`
   - Segments customers by purchase behavior
   - Counts customers in each segment

4. `vw_analytics_top_countries`
   - Aggregates orders by country
   - Calculates total value per country

## Error Handling

- Graceful handling if any individual query fails
- Empty state handling if no data exists
- Loading state during data fetching

## Potential Optimizations

- Add time period selector (30d, 90d, YTD, etc.)
- Add export functionality for data
- Implement data caching for improved performance
- Add comparison to previous periods 
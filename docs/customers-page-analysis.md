# Customers Page Analysis

## Page Overview

The Customers page provides insights into customer segments, lifetime value distribution, churn forecasting, and loyalty metrics. It helps merchants understand their customer base and identify potential issues or opportunities.

## Components Structure

1. **CustomerSegmentsTable**
   - Tabular display of customer segments
   - Shows segment name, customer count, and average order value
   - Helps identify most valuable segments

2. **LtvDistributionChart**
   - Bar chart showing customer lifetime value distribution
   - Groups customers by spending buckets
   - Visualizes spending patterns across the customer base

3. **ChurnForecastChart**
   - Chart showing customers at risk of churning
   - Potentially displays days since last purchase
   - Helps identify customers that need re-engagement

4. **BestCustomers**
   - Component showing ratio of repeat vs. new customers
   - Key loyalty metric for business health

## Data Requirements

### SegmentData Interface
```typescript
export interface SegmentData {
  segment: string
  customer_count: number
  avg_order_value: number
}
```

### LtvBucket Interface
```typescript
export interface LtvBucket {
  bucket: string
  count: number
}
```

### ChurnCandidate Interface
```typescript
export interface ChurnCandidate {
  id: string
  email: string
  days_inactive: number
}
```

### RepeatRatio Interface
```typescript
export interface RepeatRatio {
  repeat_customers: number
  new_customers: number
}
```

## API Endpoints Needed

1. `/functions/v1/metrics_customer_segments`
   - Returns array of SegmentData objects
   - Customer segments with counts and average values
   - Powers the Customer Segments table

2. `/functions/v1/metrics_ltv_distribution`
   - Returns array of LtvBucket objects
   - LTV buckets with customer counts
   - Powers the LTV Distribution chart

3. `/functions/v1/metrics_churn_candidates`
   - Returns array of ChurnCandidate objects
   - Customers at risk of churning
   - Powers the Churn Forecast chart

4. `/functions/v1/metrics_repeat_ratio`
   - Returns a RepeatRatio object
   - Ratio of repeat vs. new customers
   - Powers the Best Customers component

## Database Views/Tables Needed

1. `vw_customer_segments`
   - Segments customers based on purchase patterns
   - Calculates metrics for each segment

2. `vw_ltv_distribution`
   - Calculates lifetime spending for each customer
   - Groups into meaningful buckets

3. `vw_churn_candidates`
   - Identifies customers who haven't purchased recently
   - Calculates days since last purchase

4. `vw_repeat_customers`
   - Identifies repeat vs. new customers
   - Calculates ratio for overall loyalty metric

## Error Handling

- Loading state during data fetching
- Error state with retry capability
- Graceful handling of empty data sets
- Fallback UI for when specific metrics aren't available

## Potential Optimizations

1. Add filtering capabilities by:
   - Time period
   - Customer segment
   - Purchase channel

2. Add export functionality for customer lists
3. Implement real-time updates for critical metrics
4. Add trend indicators for key metrics
5. Include comparison to industry benchmarks 
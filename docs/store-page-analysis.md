# Store Page Analysis

## Page Overview

The Store page provides an overall health assessment of the merchant's store, focusing on system status, performance metrics, and potential issues or opportunities. It presents a holistic view of store operations and infrastructure through a health score and component breakdown.

## Components Structure

1. **Store Health Index Card**
   - Main card showing overall store health score (0-100)
   - Includes trend indicator showing improvement/decline
   - Provides immediate visual indicator of store health

2. **Component Health Cards**
   - Four subcomponents showing individual health aspects:
     - Webhook Delivery: Reliability of external notifications
     - Function Reliability: Performance of backend functions
     - Data Freshness: How up-to-date the store data is
     - System Stability: Overall system error levels
   - Each shows a score, issues, and opportunities

## Data Requirements

### StoreHealthScore Interface
```typescript
export interface StoreHealthScore {
  overall: number
  trend: number
  components: {
    name: string
    score: number
    trend?: number
    issues?: string[]
    opportunities?: string[]
  }[]
}
```

## Data Sources

The `useStoreData` hook fetches data from three primary sources:

1. `/rest/v1/vw_store_health_summary`
   - Overall store health metrics
   - Hours since last sync
   - Recent error counts

2. `/rest/v1/vw_webhook_success_rate`
   - Webhook delivery success rates by type
   - Used for calculating webhook health

3. `/rest/v1/vw_function_usage_summary`
   - Function success rates
   - Used for calculating backend function reliability

## Computation Logic

The health scores are calculated as follows:

1. **Webhook Score**: Average success rate across all webhooks
2. **Function Score**: Average success rate across all backend functions
3. **Freshness Score**: Penalizes based on hours since last data sync (100 - min(48, hours_since_last_sync) * 2)
4. **Error Penalty**: Deducts points based on recent errors (min(100, recent_errors * 5))
5. **Overall Score**: Average of component scores minus error penalty

## Database Views/Tables Needed

1. `vw_store_health_summary`
   - Contains overall health metrics
   - Tracks sync times and error counts

2. `vw_webhook_success_rate`
   - Tracks webhook delivery success/failure
   - Grouped by webhook type

3. `vw_function_usage_summary`
   - Tracks serverless function success/failure
   - Includes function-specific success rates

## Error Handling

- Loading state during data fetching
- Error state with descriptive message
- Fallback to empty state if data cannot be retrieved
- Graceful component rendering if only partial data is available

## Potential Optimizations

1. Add historical health trends over time
2. Include detailed error logs for debugging issues
3. Add alert thresholds for critical health metrics
4. Implement automatic recovery suggestions
5. Add webhook and function testing capabilities
6. Include performance metrics beyond just success/failure rates 